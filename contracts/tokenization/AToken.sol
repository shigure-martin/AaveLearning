/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-16 10:18:59
 * @LastEditors: Martin
 * @LastEditTime: 2023-02-16 10:33:26
 */
//SPDX-License-Identifier:MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../configuration/LendingPoolAddressesProvider.sol";
import "../libraries/WadRayMath.sol";


contract AToken is ERC20 {
    using WadRayMath for uint256;

    uint256 public constant UINT_MAX_VALUE = type(uint256).max;

    address public underlyingAssetAddress;

    mapping (address => uint256) private userIndexes;
    mapping (address => address) private interestRedirectionAddresses;
    mapping (address => uint256) private redirectBalances;
    mapping (address => address) private interestRedirctionAllowances;

    LendingPoolAddressesProvider private addressesProvider;
    //todo

    
}