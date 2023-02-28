/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-27 17:20:46
 * @LastEditors: Martin
 * @LastEditTime: 2023-02-28 13:39:26
 */
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("atoken-modifiers", function() {
    const [owner, otherAccount] = ethers.getSigners();
    
    const AToken = ethers.getContractFactory("AToken");
    const _aDai = AToken.deploy()
});