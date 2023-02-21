/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-16 10:18:59
 * @LastEditors: Martin
 * @LastEditTime: 2023-02-21 16:48:24
 */
//SPDX-License-Identifier:MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../configuration/LendingPoolAddressesProvider.sol";
import "../lendingpool/LendingPool.sol";
import "../lendingpool/LendingPoolDataProvider.sol";
import "../lendingpool/LendingPoolCore.sol";
import "../libraries/WadRayMath.sol";


contract AToken is ERC20 {
    using WadRayMath for uint256;
    using SafeMath for uint256;

    uint256 public constant UINT_MAX_VALUE = type(uint256).max;

    event Redeem(
        address indexed _from,
        uint256 _value,
        uint256 _fromBalanceIncrease,
        uint256 _fromIndex
    );

    event MintOnDeposit(
        address indexed _from,
        uint256 _value,
        uint256 _fromBalanceIncrease,
        uint256 _fromIndex
    );

    event BurnOnLiquidation(
        address indexed _from,
        uint256 _value,
        uint256 _fromBalanceIncrease,
        uint256 _fromIndex
    );

    event BalanceTransfer(
        address indexed _from,
        address indexed _to,
        uint256 _value,
        uint256 _fromBalanceIncrease,
        uint256 _toBalanceIncrease,
        uint256 _fromIndex,
        uint256 _toIndex
    );

    event InterestStreamRedirected(
        address indexed _from,
        address indexed _to,
        uint256 _redirectedBalance,
        uint256 _fromBalanceIncrease,
        uint256 _fromIndex
    );

    event RedirectedBalanceUpdated(
        address indexed _targetAddress,
        uint256 _targetBalanceIncrease,
        uint256 _targetIndex,
        uint256 _redirectedBalanceAdded,
        uint256 _redirectedBalanceRemoved
    );

    event InterestRedirectionAllowanceChanged(
        address indexed _from,
        address indexed _to
    );

    address public underlyingAssetAddress;

    mapping (address => uint256) private userIndexes;
    mapping (address => address) private interestRedirectionAddresses;
    mapping (address => uint256) private redirectedBalances;
    mapping (address => address) private interestRedirectionAllowances;

    LendingPoolAddressesProvider private addressesProvider;
    LendingPoolCore private core;
    LendingPool private pool;
    LendingPoolDataProvider private dataProvider;

    modifier onlyLendingPool {
        require (msg.sender == address(pool), "The caller of this function must be a lending pool");
        _;
    }

    modifier whenTransferAllowed(address _from, uint256 _amount) {
        require(isTransferAllowed(_from, _amount));
        _;
    }

    constructor(
        LendingPoolAddressesProvider _addressesProvider,
        address _underlyingAsset,
        // uint8 _underlyingAssetDecimals, @note default 18
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        addressesProvider = _addressesProvider;
        core = LendingPoolCore(payable(addressesProvider.getLendingPoolCore()));
        pool = LendingPool(addressesProvider.getLendingPool());
        dataProvider = LendingPoolDataProvider(addressesProvider.getLendingPoolDataProvider());

        underlyingAssetAddress = _underlyingAsset;
    }

    function _transfer(address _from, address _to, uint256 _amount) 
        internal 
        override 
        whenTransferAllowed(_from, _amount)
    {
        executeTransferInternal(_from, _to, _amount);
    }

    function redirectInterestStream(address _to) external {
        redirectInterestStreamInternal(msg.sender, _to);
    }

    function redirectInterestStreamOf(address _from, address _to) external {
        require(
            msg.sender == interestRedirectionAllowances[_from],
            "Caller is not allowed to redirect the interest of the user"
        );
        redirectInterestStreamInternal(_from, _to);
    }

    function allowInterestRedirectionTo(address _to) external {
        require(_to != msg.sender, "User cannot give allowance to himself");
        interestRedirectionAllowances[msg.sender] = _to;
        emit InterestRedirectionAllowanceChanged(
            msg.sender,
            _to
        );
    }

    //@todo:redeem

    function redeem(uint256 _amount) external {
        
        require(_amount > 0, "Amount to redeem needs to be greater than zero");

        (
            ,
            uint256 currentBalance,
            uint256 balanceIncrease,
            uint256 index 
        ) = cumulateBalanceInternal(msg.sender);

        uint256 amountToRedeem = _amount;

        if(_amount == UINT_MAX_VALUE) {
            amountToRedeem = currentBalance;
        }

        require(amountToRedeem <= currentBalance, "User cannot redeem more than the available balance");

        require(isTransferAllowed(msg.sender, amountToRedeem), "Transfer cannot be allowed");

        //if the user is redirecting his interest towards someone else,
        //we update the redirected balance of the redirection address by adding the accrued interest,
        //and removing the amount to redeem
        updateRedirectedBalanceOfRedirectionAddressInternal(msg.sender, balanceIncrease, amountToRedeem);
        
        _burn(msg.sender, amountToRedeem);

        bool userIndexReset = false;

        if(currentBalance.sub(amountToRedeem) == 0) {
            userIndexReset = resetDataOnZeroBalanceInternal(msg.sender);
        }

        pool.redeemUnderlying();

        emit Redeem(msg.sender, amountToRedeem, balanceIncrease, userIndexReset ? 0 : index);
    }

    function mintOnDeposit(address _account, uint256 _amount) external onlyLendingPool {

        (
            ,
            ,
            uint256 balanceIncrease,
            uint256 index 
        ) = cumulateBalanceInternal(_account);
        
        //if the user is redirecting his interest towards someone else,
        //we update the redirected balance of the redirection address by adding the accrued interest
        //and the amount deposited
        updateRedirectedBalanceOfRedirectionAddressInternal(_account, balanceIncrease.add(_amount), 0);
        
        _mint(_account, _amount);

        emit MintOnDeposit(_account, _amount, balanceIncrease, index);
    }

    function burnOnLiquidation(address _account, uint256 _value) external onlyLendingPool {

        (
            ,
            uint256 accountBalance,
            uint256 balanceIncrease,
            uint256 index
        ) = cumulateBalanceInternal(_account);

        //adds the accrued interest and substracts the burned amount to
        //the redirected balance
        updateRedirectedBalanceOfRedirectionAddressInternal(_account, balanceIncrease, _value);

        _burn(_account, _value);

        bool userIndexReset = false;

        if(accountBalance.sub(_value) == 0) {
            userIndexReset = resetDataOnZeroBalanceInternal(_account);
        }

        emit BurnOnLiquidation(_account, _value, balanceIncrease, userIndexReset ? 0 : index);
    }

    //transferOnLiquidation
    function transferOnLiquidation(address _from, address _to, uint256 _value) external onlyLendingPool {
        executeTransferInternal(_from, _to, _value);
    }

    function balanceOf(address _user) public override view returns (uint256) {

        uint256 currentPrincipalBalance = super.balanceOf(_user);
        //balance redirected by other users to _user for interest rate accrual
        uint256 redirectedBalance = redirectedBalances[_user];

        if(currentPrincipalBalance == 0 && redirectedBalance == 0) {
            return 0;
        }

        //if the _user is not redirecting the interest to anybody, accrues
        //the interest for himself

        if(interestRedirectionAddresses[_user] == address(0)) {
            //accruing for himself means that both the principal balance and
            //the redirected balance partecipate in the interest
            return calculateCumulatedBalanceInternal(
                _user,
                currentPrincipalBalance.add(redirectedBalance)
            ).sub(redirectedBalance);
        } else {
            //if the user redirected the interest, then only the redirected
            //balance generates interest. In that case, the interest generated
            //by the redirected balance is added to the current principal balance.
            return currentPrincipalBalance.add(
                calculateCumulatedBalanceInternal(
                    _user,
                    redirectedBalance
                ).sub(redirectedBalance)
            );
        }
    }

    function principalBalanceOf(address _user) external view returns(uint256) {
        return super.balanceOf(_user);
    }

    function totalSupply() public override view returns(uint256) {
        
        uint256 currentSupplyPrincipal = super.totalSupply();

        if(currentSupplyPrincipal == 0) {
            return 0;
        }

        return currentSupplyPrincipal
            .wadToRay()
            .rayMul(core.getReserveNormalizedIncome(underlyingAssetAddress))
            .rayToWad();
    }

    function isTransferAllowed(address _user, uint256 _amount) public view returns (bool) {
        return dataProvider.balanceDecreaseAllowed(underlyingAssetAddress, _user, _amount);
    }

    function getUserIndex(address _user) external view returns(uint256) {
        return userIndexes[_user];
    }

    function getInterestRedirectAddress(address _user) external view returns(address) {
        return interestRedirectionAddresses[_user];
    }

    function getRedirectedBalance(address _user) external view returns(uint256) {
        return redirectedBalances[_user];
    }

    function cumulateBalanceInternal(address _user)
        internal
        returns(uint256, uint256, uint256, uint256)
    {
        uint256 previousPrincipalBalance = super.balanceOf(_user);

        //calculate the accrued interest since the last accumulation
        uint256 balanceIncrease = balanceOf(_user).sub(previousPrincipalBalance);
        //mints an amount of tokens equivalent to the amount accumulated
        _mint(_user, balanceIncrease);
        //updates the user index
        uint256 index = userIndexes[_user] = core.getReserveNormalizedIncome(underlyingAssetAddress);
        return (
            previousPrincipalBalance,
            previousPrincipalBalance.add(balanceIncrease),
            balanceIncrease,
            index
        );
    }

    function updateRedirectedBalanceOfRedirectionAddressInternal(
        address _user,
        uint256 _balanceToAdd,
        uint256 _balanceToRemove
    ) internal {
        
        address redirectionAddress = interestRedirectionAddresses[_user];
        //if there isn't any redirection, nothing to be done
        if(redirectionAddress == address(0)) {
            return;
        }
        
        //compound balances og teh redirected address
        ( , , uint256 balanceIncrease, uint256 index) = cumulateBalanceInternal(redirectionAddress);

        //updating the redirected balance
        redirectedBalances[redirectionAddress] = redirectedBalances[redirectionAddress]
            .add(_balanceToAdd)
            .sub(_balanceToRemove);

        address targetOfRedirectionAddress = interestRedirectionAddresses[redirectionAddress];

        if(targetOfRedirectionAddress != address(0)) {
            redirectedBalances[targetOfRedirectionAddress] = redirectedBalances[targetOfRedirectionAddress].add(balanceIncrease);
        }

        emit RedirectedBalanceUpdated(
            redirectionAddress,
            balanceIncrease,
            index,
            _balanceToAdd,
            _balanceToRemove
        );
    }

    function calculateCumulatedBalanceInternal(
        address _user,
        uint256 _balance
    ) internal view returns (uint256) {
        return _balance
            .wadToRay()
            .rayMul(core.getReserveNormalizedIncome(underlyingAssetAddress))
            .rayDiv(userIndexes[_user])
            .rayToWad();
    }

    function executeTransferInternal(
        address _from,
        address _to,
        uint256 _value
    ) internal {
        require(_value > 0, "Transferred amount needs to be greater than zero");

        //cumulate the balance of the sender
        (
            ,
            uint256 fromBalance,
            uint256 fromBalanceIncrease,
            uint256 fromIndex
        ) = cumulateBalanceInternal(_from);

        //cumulate the balance of the receiver
        (
            ,
            ,
            uint256 toBalanceIncrease,
            uint256 toIndex
        ) = cumulateBalanceInternal(_to);

        //if the sender is redirecting his interest towards someone else,
        //adds to the redirected balance the accrued interest and removes the amount
        //being transferred
        updateRedirectedBalanceOfRedirectionAddressInternal(_from, fromBalanceIncrease, _value);

        //if the receiver is redirecting his interest towards someone else,
        //adds to the redirected balance the accrued interest and the amount
        //being transferred
        updateRedirectedBalanceOfRedirectionAddressInternal(_to, toBalanceIncrease.add(_value), 0);

        //performs the transfer
        super._transfer(_from, _to, _value);

        bool fromIndexReset = false;
        //reset the user data if the remaining balance is 0
        if(fromBalance.sub(_value) == 0) {
            fromIndexReset = resetDataOnZeroBalanceInternal(_from);
        }

        emit BalanceTransfer(
            _from,
            _to,
            _value,
            fromBalanceIncrease,
            toBalanceIncrease,
            fromIndexReset ? 0 : fromIndex,
            toIndex
        );
    }

    function redirectInterestStreamInternal(
        address _from,
        address _to
    ) internal {

        address currentRedirectionAddress = interestRedirectionAddresses[_from];

        require(_to != currentRedirectionAddress, "Interest is already redirected to the user");

        (
            uint256 previousPrincipalBalance,
            uint256 fromBalance,
            uint256 balanceIncrease,
            uint256 fromIndex
        ) = cumulateBalanceInternal(_from);

        require(fromBalance > 0, "Interest stream can only be redirected if there is a valid balance");

        //if the user is already redirecting the interest to someone, before changing
        //the redirection address we substract the redirected balance of the previous
        //recipient
        if(currentRedirectionAddress != address(0)) {
            updateRedirectedBalanceOfRedirectionAddressInternal(_from, 0, previousPrincipalBalance);
        }

        //if the user is redirecting the interest back to himself,
        //we simply set to 0 the interest redirection address
        if(_to == _from) {
            interestRedirectionAddresses[_from] = address(0);
            emit InterestStreamRedirected(
                _from,
                address(0),
                fromBalance,
                balanceIncrease,
                fromIndex
            );
            return;
        }

        interestRedirectionAddresses[_from] = _to;

        updateRedirectedBalanceOfRedirectionAddressInternal(_from, fromBalance, 0);

        emit InterestStreamRedirected(
            _from,
            _to,
            fromBalance,
            balanceIncrease,
            fromIndex
        );
    }

    function resetDataOnZeroBalanceInternal(address _user) internal returns(bool) {

        //if the user has 0 principal balance, the interest stream redirection gets reset
        interestRedirectionAddresses[_user] = address(0);

        //emits a InterestStreamRedirected event to notify that the redirection has been reset
        emit InterestStreamRedirected(_user, address(0), 0, 0, 0);

        //if the redirected balance is also 0, we clear up the user index
        if(redirectedBalances[_user] == 0) {
            userIndexes[_user] = 0;
            return true;
        } else {
            return false;
        }
    }
}