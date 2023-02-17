/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-15 13:48:40
 * @LastEditors: Martin
 * @LastEditTime: 2023-02-17 16:35:59
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

    function getLendingPool() public view returns(address) {
        return getAddress(LENDING_POOL);
    }

    function getLendingPoolCore() public view returns(address) {
        return getAddress(LENDING_POOL_CORE);
    }

    function getLendingPoolConfigurator() public view returns(address) {
        return getAddress(LENDING_POOL_CONFIGURATOR);
    }

    function getLendingRateOracle() public view returns(address) {
        return getAddress(LENDING_RATE_ORACLE);
    }

}