/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-15 13:48:40
 * @LastEditors: Martin
 * @LastEditTime: 2023-02-22 17:51:52
 */
//SPDX-License-Identifier:MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./AddressStorage.sol";

contract LendingPoolAddressesProvider is Ownable, AddressStorage {

    //event LendingPoolUpdate(address indexed newAddress);

    bytes32 private constant LENDING_POOL = "LENDING_POOL";
    bytes32 private constant LENDING_POOL_CORE = "LENDING_POOL_CORE";
    bytes32 private constant LENDING_POOL_CONFIGURATOR = "LENDING_POOL_CONFIGURATOR";
    bytes32 private constant LENDING_RATE_ORACLE = "LENDING_RATE_ORACLE";
    bytes32 private constant PRICE_ORACLE = "PRICE_ORACLE";
    bytes32 private constant FEE_PROVIDER = "FEE_PROVIDER";
    bytes32 private constant DATA_PROVIDER = "DATA_PROVIDER";
    bytes32 private constant LENDING_POOL_PARAMETERS_PROVIDER = "PARAMETERS_PROVIDER";
    bytes32 private constant TOKEN_DISTRIBUTOR = "TOKEN_DISTRIBUTOR";
    bytes32 private constant LENDING_POOL_LIQUIDATION_MANAGER = "LIQUIDATION_MANAGER";

    event LendingPoolUpdated(address indexed newAddress);
    event LendingPoolCoreUpdated(address indexed newAddress);
    event LendingPoolConfiguratorUpdated(address indexed newAddress);
    event LendingRateOracleUpdated(address indexed newAddress);
    event PriceOracleUpdated(address indexed newAddress);
    event FeeProviderUpdated(address indexed newAddress);
    event DataProviderUpdated(address indexed newAddress);
    event LendingPoolParametersUpdated(address indexed newAddress);
    event TokenDistributorUpdated(address indexed newAddress);
    event LendingPoolLiquidationManagerUpdated(address indexed newAddress);

    function getLendingPool() public view returns(address) {
        return getAddress(LENDING_POOL);
    }

    function setLendingPool(address _pool) public onlyOwner {
        _setAddress(LENDING_POOL, _pool);
        emit LendingPoolUpdated(_pool);
    }

    function getLendingPoolCore() public view returns(address) {
        return getAddress(LENDING_POOL_CORE);
    }

    function setLendingPoolCore(address _core) public onlyOwner {
        _setAddress(LENDING_POOL_CORE, _core);
        emit LendingPoolCoreUpdated(_core);
    }

    function getLendingPoolConfigurator() public view returns(address) {
        return getAddress(LENDING_POOL_CONFIGURATOR);
    }

    function setLendingPoolConfigurator(address _configurator) public onlyOwner {
        _setAddress(LENDING_POOL_CONFIGURATOR, _configurator);
        emit LendingPoolConfiguratorUpdated(_configurator);
    }

    function getLendingRateOracle() public view returns(address) {
        return getAddress(LENDING_RATE_ORACLE);
    }

    function setLendingRateOracle(address _rateOracle) public onlyOwner {
        _setAddress(LENDING_RATE_ORACLE, _rateOracle);
        emit LendingRateOracleUpdated(_rateOracle);
    } 

    function getPriceOracle() public view returns (address) {
        return getAddress(PRICE_ORACLE);
    }

    function setPriceOracle(address _priceOracle) public onlyOwner {
        _setAddress(PRICE_ORACLE, _priceOracle);
        emit PriceOracleUpdated(_priceOracle);
    }

    function getFeeProvider() public view returns (address) {
        return getAddress(FEE_PROVIDER);
    }

    function setFeeProvider(address _feeProvider) public onlyOwner {
        _setAddress(FEE_PROVIDER, _feeProvider);
        emit FeeProviderUpdated(_feeProvider);
    }

    function getLendingPoolDataProvider() public view returns (address) {
        return getAddress(DATA_PROVIDER);
    }
    
    function setLendingPoolDataProvider(address _dataProvider) public onlyOwner{
        _setAddress(DATA_PROVIDER, _dataProvider);
        emit DataProviderUpdated(_dataProvider);
    }

    function getLendingPoolParametersProvider() public view returns (address) {
        return getAddress(LENDING_POOL_PARAMETERS_PROVIDER);
    }

    function setLendingPoolParametersProvider(address _parametersProvider) public onlyOwner{
        _setAddress(LENDING_POOL_PARAMETERS_PROVIDER, _parametersProvider);
        emit LendingPoolParametersUpdated(_parametersProvider);
    }

    function getTokenDistributor() public view returns (address) {
        return getAddress(TOKEN_DISTRIBUTOR);
    }

    function setTokenDistributor(address _distributor) public onlyOwner {
        _setAddress(TOKEN_DISTRIBUTOR, _distributor);
        emit TokenDistributorUpdated(_distributor);
    }

    function getLendingPoolLiquidationManager() public view returns (address) {
        return getAddress(LENDING_POOL_LIQUIDATION_MANAGER);
    }

    function setLendingPoolLiquidationManager(address _liquidationManager) public onlyOwner {
        _setAddress(LENDING_POOL_LIQUIDATION_MANAGER, _liquidationManager);
        emit LendingPoolLiquidationManagerUpdated(_liquidationManager);
    }
}