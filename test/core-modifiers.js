/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-03-13 09:46:06
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-13 15:34:33
 */
const { expect } = require("chai");
const { RAY, ETHEREUM_ADDRESS, APPROVAL_AMOUNT_LENDING_POOL_CORE, RATEMODE } = require("../utils/constants");
const { ethers } = require("hardhat");
const { instancesConfig } = require("./instanceConfigure");
const { BigNumber } = require("ethers");

describe("LendingPoolCore: Modifiers", async function () {
    const decimal = BigNumber.from(10).pow(18);

    var Accounts, core, token, aToken, pool, poolConfigurator;

    async function init() {
        [...Accounts] = await ethers.getSigners();

        //Get the contracts' instances
        const config = await instancesConfig(Accounts);
        core = config.core;
        token = config.token;
        aToken = config.aToken;
        pool = config.pool;
        poolConfigurator = config.poolConfigurator;
    }

    before("initial test:", async function () {
        await init();
    });

    it("Tries invoke updateStateOnDeposit", async function () {
        await expect(core.updateStateOnDeposit(token.address, Accounts[0].address, "0", false))
            .to
            .be
            .revertedWith("The caller must be a lending pool contract");
    });

    it("Tries invoke updateStateOnRedeem", async function () {
        await expect(core.updateStateOnRedeem(token.address, Accounts[0].address, "0", false))
            .to
            .be
            .revertedWith("The caller must be a lending pool contract");
    });

    it("Tries invoke updateStateOnBorrow", async function () {
        await expect(core.updateStateOnBorrow(token.address, Accounts[0].address, "0", "0", RATEMODE.STABLE))
            .to
            .be
            .revertedWith("The caller must be a lending pool contract");
    });

    it("Tries invoke updateStateOnRepay", async function () {
        await expect(core.updateStateOnRepay(token.address, Accounts[0].address, "0", "0", "0", false))
            .to
            .be
            .revertedWith("The caller must be a lending pool contract");
    });

    it("Tries invoke updateStateOnSwapRate", async function () {
        await expect(core.updateStateOnSwapRate(token.address, Accounts[0].address, "0", "0", "0", RATEMODE.STABLE))
            .to
            .be
            .revertedWith("The caller must be a lending pool contract");
    });
});