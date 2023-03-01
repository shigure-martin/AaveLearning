/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-27 15:03:40
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-01 16:06:48
 */
const { BigNumber } = require("ethers");

const decimal = BigNumber.from(10).pow(18);

const RAY = 1 * 10 ** 27
const ETHEREUM_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
const APPROVAL_AMOUNT_LENDING_POOL_CORE = BigNumber.from(1).mul(decimal);

module.exports = {
    RAY,
    ETHEREUM_ADDRESS,
    APPROVAL_AMOUNT_LENDING_POOL_CORE,
};