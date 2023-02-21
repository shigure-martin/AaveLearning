//SPDX-License-Identifier:MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../configuration/LendingPoolAddressesProvider.sol";
import "../configuration/LendingPoolParametersProvider.sol";
import "../tokenization/AToken.sol";
import "../libraries/CoreLibrary.sol";
import "../libraries/WadRayMath.sol";
import "../libraries/EthAddressLib.sol";
import "../interfaces/IFeeProvider.sol";
import "./LendingPoolCore.sol";
import "./LendingPoolLiquidationManager.sol";
import "./LendingPoolDataProvider.sol";

contract LendingPool is ReentrancyGuard {
    using SafeMath for uint256;
    using Address for address;

    modifier onlyAmountGreaterThanZero(uint256 _amount) {
        requireAmountGreaterThanZeroInternal(_amount);
        _;
    }
    
    function deposit(address _reserve, uint256 amount)
        external
        payable
        nonReentrant
        onlyAmountGreaterThanZero(amount)
    {
        
    }

    function requireAmountGreaterThanZeroInternal(uint256 _amount) internal pure {
        require(_amount > 0, "Amount must greater than 0");
    }
}
