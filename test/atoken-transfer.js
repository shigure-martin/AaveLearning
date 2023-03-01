/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-03-01 10:23:11
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-01 16:25:07
 */
const { BigNumber } = require("ethers");

const { expect } = require("chai");
const { ETHEREUM_ADDRESS, APPROVAL_AMOUNT_LENDING_POOL_CORE } = require("../utils/constants");
const { 
    LendingPoolCoreInstance, 
    TokenInstance, 
    LendingPoolInstance,
    AddressesProviderInstance
} = require("./testEnvProvider");

describe("atoken-transfer", function () {
    async function init () {
        const [owner, otherAccount] = await ethers.getSigners();

        const { addressesProvider } = await AddressesProviderInstance();
        const { core } = await LendingPoolCoreInstance();
        const { pool } = await LendingPoolInstance();
        const { token } = await TokenInstance(otherAccount, "dai", "DAI");

        pool.initialize(addressesProvider.address);
        
        return {otherAccount, owner, core, token, pool};
    }

    describe("initializing tests", function () {
        it("User 0 deposits 1000 DAI, transfers to user 1", async function () {
            const {otherAccount, owner, core, token, pool} = await init();
            const decimal = BigNumber.from(10).pow(18);
            await token.mint(BigNumber.from(1000).mul(decimal), {from: otherAccount.address});

            const v = pool.core();
            console.log(v);
            await token.connect(otherAccount).approve(
                core.address, 
                APPROVAL_AMOUNT_LENDING_POOL_CORE,
            );
            
            const depositAmount = BigNumber.from(1000).mul(decimal);

            await pool.connect(otherAccount).deposit(
                token.address, 
                depositAmount,
                '0'
            );

            await token.connect(otherAccount).transfer(owner, depositAmount);

            var otherAcBalance = await token.balanceOf(otherAccount.address);
            const ownerBalance = await token.balanceOf(owner.address);

            console.log(otherAcBalance);
        });
    });
});