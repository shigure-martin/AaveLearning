/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-03-01 10:59:33
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-10 14:37:40
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

    it("Check the onlyLendingPoolManager on disableReserveStableBorrowRate", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).disableReserveStableBorrowRate(ETHEREUM_ADDRESS))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });
    it("Check the onlyLendingPoolManager on enableReserveStableBorrowRate", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).enableReserveStableBorrowRate(ETHEREUM_ADDRESS))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });

    it("Changes LTV of the reserve", async function () {
        await poolConfigurator.setReserveBaseLTVasCollateral(ETHEREUM_ADDRESS, "60");
        const data = await pool.getReserveConfigurationData(ETHEREUM_ADDRESS);
        expect(data.ltv).to.be.equal("60", "Invalid LTV");
    });

    it("Check the onlyLendingPoolManager on setReserveBaseLTVasCollateral", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).setReserveBaseLTVasCollateral(ETHEREUM_ADDRESS, "75"))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });

    it("Changes liquidation threshold of the reserve", async function () {
        await poolConfigurator.setReserveLiquidationThreshold(ETHEREUM_ADDRESS, "75");
        const data = await pool.getReserveConfigurationData(ETHEREUM_ADDRESS);
        expect(data.liquidationThreshold).to.be.equal("75", "Invalid Liquidation threshold");
    });
    it("Check the onlyLendingPoolManager on setReserveLiquidationThreshold", async function () {
        await expect(poolConfigurator.connect(Accounts[2]).setReserveLiquidationThreshold(ETHEREUM_ADDRESS, "80"))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });

    it("Changes liquidation bonus of the reserve", async function () {
        await poolConfigurator.setReserveLiquidationBonus(ETHEREUM_ADDRESS, "110");
        const bonus = await core.getReserveLiquidationBonus(ETHEREUM_ADDRESS);
        expect(bonus).to.be.equal("110", "Invalid Liquidation discount");
    });
    it("Check the onlyLendingPoolManager on setReserveLiquidationBonus", async function () {
        expect(poolConfigurator.connect(Accounts[2]).setReserveLiquidationBonus(ETHEREUM_ADDRESS, "80"))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });

    it("Check the onlyLendingPoolManager on setReserveDecimals", async function () {
        expect(poolConfigurator.connect(Accounts[2]).setReserveDecimals(ETHEREUM_ADDRESS, "20"))
            .to
            .be
            .revertedWith("The caller must be a lending pool manager");
    });

    it("Removes the last added reserve", async function () {
        const reservesBefore = await pool.getReserves();

        const lastReserve = reservesBefore[reservesBefore.length - 1];

        await poolConfigurator.removeLastAddedReserve(lastReserve);

        const reservesAfter = await pool.getReserves();

        expect(reservesAfter.length).to.be.equal(reservesBefore.length - 1, "Invalid number of reserves after remove");
    });

    it("Reverts when trying to disable the DAI reserve with liquidity on it", async function () {
        await token.connect(Accounts[2]).mint(BigNumber.from(1000).mul(decimal));

        await token.connect(Accounts[2]).approve(core.address, APPROVAL_AMOUNT_LENDING_POOL_CORE);

        await pool.connect(Accounts[2]).deposit(token.address, BigNumber.from(1000).mul(decimal), "0");

        await expect(poolConfigurator.deactivateReserve(token.address))
            .to
            .be
            .revertedWith("The liquidity of the reserve needs to be 0");
    });
});