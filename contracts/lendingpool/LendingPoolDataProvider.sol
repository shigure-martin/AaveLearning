/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-20 10:55:45
 * @LastEditors: Martin
 * @LastEditTime: 2023-02-20 11:23:01
 */
//SPDX-License-Identifier:MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../libraries/CoreLibrary.sol";
import "../libraries/WadRayMath.sol";
import "../configuration/LendingPoolAddressesProvider.sol";
import "../interfaces/IPriceOracleGetter.sol";
import "../tokenization/AToken.sol";

import "./LendingPoolCore.sol";

contract LendingPoolDataProvider {
    using SafeMath for uint256;
    using WadRayMath for uint256;

    LendingPoolCore public core;
    LendingPoolAddressesProvider public addressesProvider;
}
