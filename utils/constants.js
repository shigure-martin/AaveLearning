/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-27 15:03:40
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-07 10:02:55
 */
const { BigNumber } = require("ethers");

const decimal = BigNumber.from(10).pow(27);

const RAY = 1 * 10 ** 27
const ETHEREUM_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
const APPROVAL_AMOUNT_LENDING_POOL_CORE = BigNumber.from(1).mul(decimal);
const RATEMODE = {
    NONE: 0,
    STABLE: 1,
    VARIABLE: 2,
}
{}

module.exports = {
    RAY,
    ETHEREUM_ADDRESS,
    APPROVAL_AMOUNT_LENDING_POOL_CORE,
    RATEMODE,
};