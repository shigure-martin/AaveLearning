/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-03-13 09:46:06
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-13 17:54:30
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

    it("Tries invoke updateStateOnRebalance", async () => {
    

    await expect(
        core.updateStateOnRebalance(token.address, Accounts[0].address, "0"),
        ).to.be.revertedWith("The caller must be a lending pool contract"
    )
    })

    it("Tries invoke updateStateOnLiquidation", async () => {
    

    await expect(
        core.updateStateOnLiquidation(
        ETHEREUM_ADDRESS,
        token.address,
        Accounts[0].address,
        "0",
        "0",
        "0",
        "0",
        "0",
        false,
        ),
        ).to.be.revertedWith("The caller must be a lending pool contract"
    )
    })


    it("Tries invoke setUserUseReserveAsCollateral", async () => {

    await expect(
        core.setUserUseReserveAsCollateral(
        ETHEREUM_ADDRESS,
        Accounts[0].address,
        false,
        ),
        ).to.be.revertedWith("The caller must be a lending pool contract"
    )
    })

    it("Tries invoke transferToUser", async () => {

    await expect(
        core.transferToUser(
        ETHEREUM_ADDRESS,
        Accounts[0].address,
        "0",
        ),
        ).to.be.revertedWith("The caller must be a lending pool contract"
    )
    })

    it("Tries invoke transferToReserve", async () => {

    await expect(
        core.transferToReserve(
        ETHEREUM_ADDRESS,
        Accounts[0].address,
        "0",
        ),
        ).to.be.revertedWith("The caller must be a lending pool contract"
    )
    })

    it("Tries invoke transferToFeeCollectionAddress", async () => {

    await expect(
        core.transferToFeeCollectionAddress(
        ETHEREUM_ADDRESS,
        Accounts[0].address,
        "0",
        Accounts[0].address
        ),
        ).to.be.revertedWith("The caller must be a lending pool contract"
    )
    })

    it("Tries invoke liquidateFee", async () => {

    await expect(
        core.liquidateFee(
        ETHEREUM_ADDRESS,
        "0",
        Accounts[0].address
        ),
        ).to.be.revertedWith("The caller must be a lending pool contract"
    )
    })

    it("Tries invoke initReserve", async () => {
    

    await expect(
        core.initReserve(
        token.address,
        token.address,
        "18",
        Accounts[0].address,
        ),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    })

    it("Tries invoke refreshConfiguration", async () => {

    await expect(
        core.refreshConfiguration(),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    })

    it("Tries invoke enableBorrowingOnReserve, disableBorrowingOnReserve", async () => {
    

    await expect(
        core.enableBorrowingOnReserve(token.address, false),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    await expect(
        core.refreshConfiguration(),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
        )
    
    })

    it("Tries invoke freezeReserve, unfreezeReserve", async () => {
    

    await expect(
        core.freezeReserve(token.address),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    await expect(
        core.unfreezeReserve(token.address),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
        )
    
    })

    it("Tries invoke enableReserveAsCollateral, disableReserveAsCollateral", async () => {
    

    await expect(
        core.enableReserveAsCollateral(token.address,
        0,
        0,
        0),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    await expect(
        core.disableReserveAsCollateral(token.address),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
        )
    
    })

    it("Tries invoke enableReserveStableBorrowRate, disableReserveStableBorrowRate", async () => {
    

    await expect(
        core.enableReserveStableBorrowRate(token.address),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    await expect(
        core.disableReserveStableBorrowRate(token.address),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
        )
    
    })

    it("Tries invoke setReserveDecimals", async () => {
    

    await expect(
        core.setReserveDecimals(token.address, "0"),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    
    })

    it("Tries invoke removeLastAddedReserve", async () => {
    

    await expect(
        core.removeLastAddedReserve(token.address),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    
    })

    it("Tries invoke setReserveBaseLTVasCollateral", async () => {
    

    await expect(
        core.setReserveBaseLTVasCollateral(token.address, "0"),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    
    })

    it("Tries invoke setReserveLiquidationBonus", async () => {
    

    await expect(
        core.setReserveLiquidationBonus(token.address, "0"),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    
    })

    it("Tries invoke setReserveLiquidationThreshold", async () => {
    

    await expect(
        core.setReserveLiquidationThreshold(token.address, "0"),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    
    })

    it("Tries invoke setReserveInterestRateStrategyAddress", async () => {
    

    await expect(
        core.setReserveInterestRateStrategyAddress(token.address, Accounts[0].address),
        ).to.be.revertedWith("The caller must be a lending pool configurator contract"
    )
    
    })
});