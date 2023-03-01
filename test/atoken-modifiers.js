/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-27 17:20:46
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-01 16:05:31
 */
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ETHEREUM_ADDRESS } = require("../utils/constants");
const { 
    AddressesProviderInstance,
    LendingPoolCoreInstance,
    LendingPoolInstance,
    DataProviderInstance
} = require("./testEnvProvider");

describe("atoken-modifiers", function() {

    async function initAToken() {
        const [owner, otherAccount] = await ethers.getSigners();

        const { addressesProvider } = await AddressesProviderInstance();
        const { core } = await LendingPoolCoreInstance();
        const { pool } = await LendingPoolInstance();
        const { dataProvider } = await DataProviderInstance();

        const AToken = await ethers.getContractFactory("AToken");
        const _aDai = await AToken.deploy(
            addressesProvider.address,
            ETHEREUM_ADDRESS,
            "wrapedETH",
            "WETH"
        );
        return{ _aDai, owner, otherAccount };
    }
    
    describe("test", function() {
        it("Tries to invoke mintOnDeposit", async function() {
            const {_aDai, owner, otherAccount} = await initAToken();
            await expect(_aDai.mintOnDeposit(owner.address, "1")).to.be.revertedWith(
                "The caller of this function must be a lending pool"
            );
        });

        it("Tries to invoke burnOnLiquidation", async function() {
            const {_aDai, owner} = await initAToken();
            await expect(_aDai.burnOnLiquidation(owner.address, "1")).to.be.revertedWith(
                "The caller of this function must be a lending pool"
            );
        });

        it("Tries to invoke transferOnLiquidation", async function() {
            const {_aDai, owner, otherAccount} = await initAToken();
            await expect(_aDai.transferOnLiquidation(owner.address, otherAccount.address, "1")).to.be.revertedWith(
                "The caller of this function must be a lending pool"
            );
        });
    });
});