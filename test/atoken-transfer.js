/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-03-01 10:23:11
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-03 18:04:09
 */
const { BigNumber } = require("ethers");

const { expect } = require("chai");
const { ETHEREUM_ADDRESS, APPROVAL_AMOUNT_LENDING_POOL_CORE } = require("../utils/constants");
const { 
    LendingPoolCoreInstance, 
    TokenInstance, 
    ATokenInstance,
    LendingPoolInstance,
    AddressesProviderInstance,
    PoolConfiguratorInstance,
    DataProviderInstance,
    InterestRateStrategyInstance
} = require("./testEnvProvider");

describe("atoken-transfer", function () {
    async function init () {
        const [owner, otherAccount] = await ethers.getSigners();

        const { addressesProvider } = await AddressesProviderInstance(owner);
        const { core } = await LendingPoolCoreInstance();
        const { pool } = await LendingPoolInstance();
        const { token } = await TokenInstance(otherAccount, "dai", "DAI");
        const { dataProvider } = await DataProviderInstance();
        //const { aToken } = await ATokenInstance(addressesProvider.address, token.address, await token.name(), await token.symbol());
        const { strategy } = await InterestRateStrategyInstance(token.address);

        pool.initialize(addressesProvider.address);
        core.initialize(addressesProvider.address);

        const { poolConfigurator } = await PoolConfiguratorInstance();
        
        return {otherAccount, owner, core, token, pool, poolConfigurator, strategy};
    }

    describe("initializing tests", function () {
        it("User 0 deposits 1000 DAI, transfers to user 1", async function () {
            const {otherAccount, owner, core, token, pool, poolConfigurator, strategy} = await init();
            await poolConfigurator.refreshLendingPoolCoreConfiguration();
            await poolConfigurator.initReserve(token.address, 18, strategy.address);
            // await poolConfigurator.activateReserve(token.address);
            const decimal = BigNumber.from(10).pow(18);
            await token.mint(BigNumber.from(1000).mul(decimal), {from: otherAccount.address});

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
            
            var reserve = await core.getReserveData(token.address);
            console.log(reserve.aTokenAddress);
            await ERC20(reserve.aTokenAddress).connect(otherAccount).transfer(owner.address, depositAmount);
            //现在能拿到atoken的地址了
            var otherAcBalance = await token.balanceOf(otherAccount.address);
            const ownerBalance = await token.balanceOf(owner.address);

            console.log(otherAcBalance);
        });
    });
});