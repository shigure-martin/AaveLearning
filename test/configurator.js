/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-03-01 10:59:33
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-09 17:43:11
 */
const { expect } = require("chai");
const { RAY, ETHEREUM_ADDRESS, APPROVAL_AMOUNT_LENDING_POOL_CORE, RATEMODE } = require("../utils/constants");
const { ethers } = require("hardhat");
const { instancesConfig } = require("./instanceConfigure");
const { BigNumber } = require("ethers");


describe("Lending Pool Configurator", async function () {

    const decimal = BigNumber.from(10).pow(18);

    var Accounts, core, token, aToken, pool, dataProvider, poolConfigurator;

    async function init () {
        [...Accounts] = await ethers.getSigners();
        //configuration of instances
        const config = await instancesConfig(Accounts);
        core = config.core;
        token = config.token;
        aToken = config.aToken;
        pool = config.pool;
        poolConfigurator = config.poolConfigurator;
    }

    before("initializing tests", async function () {
        await init();
    });

    it("Deactivates the ETH reserve", async function () {
        await poolConfigurator.deactivateReserve(ETHEREUM_ADDRESS);
        const isActive = await core.getReserveIsActive(ETHEREUM_ADDRESS);
        expect(isActive).to.be.equal(false);
    });

    it("Rectivates the ETH reserve", async function () {
        await poolConfigurator.activateReserve(ETHEREUM_ADDRESS);
        const isActive = await core.getReserveIsActive(ETHEREUM_ADDRESS);
        expect(isActive).to.be.equal(true);
    });

    it("Check the onlyLendingPoolManager on deactivateReserve", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).deactivateReserve(ETHEREUM_ADDRESS))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });
    it("Check the onlyLendingPoolManager on activateReserve", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).activateReserve(ETHEREUM_ADDRESS))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });
    
    it("Freezes the ETH reserve", async function () {
        await poolConfigurator.freezeReserve(ETHEREUM_ADDRESS);
        const isFreezed = await core.getReserveIsFreezed(ETHEREUM_ADDRESS);
        expect(isFreezed).to.be.equal(true);
    });
    it("Unfreezes the ETH reserve", async function () {
        await poolConfigurator.unfreezeReserve(ETHEREUM_ADDRESS);
        const isFreezed = await core.getReserveIsFreezed(ETHEREUM_ADDRESS);
        expect(isFreezed).to.be.equal(false);
    });

    it("Check the onlyLendingPoolManager on freezeReserve", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).freezeReserve(ETHEREUM_ADDRESS))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });
    it("Check the onlyLendingPoolManager on unfreezeReserve", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).unfreezeReserve(ETHEREUM_ADDRESS))
        .to
        .be
        .revertedWith("The caller must be a lending pool manager");
    });

    it("Deactivates the ETH reserve for borrowing", async function () {
        await poolConfigurator.disableBorrowingOnReserve(ETHEREUM_ADDRESS);
        const isEnabled = await core.isReserveBorrowingEnabled(ETHEREUM_ADDRESS);
        expect(isEnabled).to.be.equal(false);
    });
    it("Activates the ETH reserve for borrowing", async function () {
        await poolConfigurator.enableBorrowingOnReserve(ETHEREUM_ADDRESS, true);
        const isEnabled = await core.isReserveBorrowingEnabled(ETHEREUM_ADDRESS);
        const interestIndex = await core.getReserveLiquidityCumulativeIndex(ETHEREUM_ADDRESS);
        expect(isEnabled).to.be.equal(true);
        expect(interestIndex.toString()).to.be.equal(RAY);
    });

    it("Check the onlyLendingPoolManager on disableBorrowingOnReserve", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).disableBorrowingOnReserve(ETHEREUM_ADDRESS))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });
    it("Check the onlyLendingPoolManager on enableBorrowingOnReserve", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).enableBorrowingOnReserve(ETHEREUM_ADDRESS, true))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });

    it("Deactivates the ETH reserve as collateral", async function () {
        await poolConfigurator.disableReserveAsCollateral(ETHEREUM_ADDRESS);
        const isEnabled = await core.isReserveUsageAsCollateralEnabled(ETHEREUM_ADDRESS);
        expect(isEnabled).to.be.equal(false);
    });
    it("Activates the ETH reserve as collateral", async function () {
        await poolConfigurator.enableReserveAsCollateral(
            ETHEREUM_ADDRESS,
            "75",
            "80",
            "105"
        );
        const isEnabled = await core.isReserveUsageAsCollateralEnabled(ETHEREUM_ADDRESS);
        expect(isEnabled).to.be.equal(true);
    });

    it("Check the onlyLendingPoolManager on disableReserveAsCollateral", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).disableReserveAsCollateral(ETHEREUM_ADDRESS))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });
    it("Check the onlyLendingPoolManager on enableReserveAsCollateral", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).enableReserveAsCollateral(ETHEREUM_ADDRESS, "75", "80", "105"))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });

    it("Disable stable borrow rate on the ETH reserve", async function () {
        await poolConfigurator.disableReserveStableBorrowRate(ETHEREUM_ADDRESS);
        const isEnabled = await core.getReserveIsStableBorrowRateEnabled(ETHEREUM_ADDRESS);
        expect(isEnabled).to.be.equal(false);
    });
    it("Enables stable borrow rate on the ETH reserve", async function () {
        await poolConfigurator.enableReserveStableBorrowRate(ETHEREUM_ADDRESS);
        const isEnabled = await core.getReserveIsStableBorrowRateEnabled(ETHEREUM_ADDRESS);
        expect(isEnabled).to.be.equal(true);
    });

    
});