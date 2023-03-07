/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-03-01 10:23:11
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-07 17:59:37
 */
const { BigNumber } = require("ethers");

const { expect } = require("chai");
const { ETHEREUM_ADDRESS, APPROVAL_AMOUNT_LENDING_POOL_CORE, RATEMODE } = require("../utils/constants");
const { 
    LendingPoolCoreInstance, 
    TokenInstance, 
    ATokenInstance,
    LendingPoolInstance,
    AddressesProviderInstance,
    PoolConfiguratorInstance,
    DataProviderInstance,
    InterestRateStrategyInstance,
    PriceOracleInstance
} = require("./testEnvProvider");

describe("atoken-transfer", function () {
    const decimal = BigNumber.from(10).pow(18);

    var Accounts, core, token, aToken, pool, dataProvider;

    async function init () {
        [...Accounts] = await ethers.getSigners();
        //create of instances

        const { addressesProvider } = await AddressesProviderInstance(Accounts[0]);
        core = await LendingPoolCoreInstance();
        pool = await LendingPoolInstance();
        token = await TokenInstance(Accounts[1], "dai", "DAI");
        // const { dataProvider } = await DataProviderInstance();
        dataProvider = await DataProviderInstance();
        //const { aToken } = await ATokenInstance(addressesProvider.address, token.address, await token.name(), await token.symbol());
        const { strategy } = await InterestRateStrategyInstance(token.address);
        const { poolConfigurator } = await PoolConfiguratorInstance();
        await PriceOracleInstance();

        //configuration of instances
        await pool.initialize(addressesProvider.address);
        await core.initialize(addressesProvider.address);
        await dataProvider.initialize(addressesProvider.address);

        await poolConfigurator.refreshLendingPoolCoreConfiguration();
        await poolConfigurator.initReserve(token.address, 18, strategy.address);
        await poolConfigurator.initReserveWithData(ETHEREUM_ADDRESS, "Aave Interest bearing ETH", "aETH", 18, strategy.address);
        await poolConfigurator.enableBorrowingOnReserve(ETHEREUM_ADDRESS, true);

        var reserve = await core.getReserveData(token.address);
        aToken = await (await ATokenInstance(reserve.aTokenAddress)).aToken;

        //return {Accounts, core, token, aToken, pool};
    }

    before("initializing tests", async function () {
        await init();
    });

    it("User 0 deposits 1000 DAI, transfers to user 1", async function () {
        //const {Accounts, core, token, aToken, pool} = await loadFixture(init);
        
        // await poolConfigurator.activateReserve(token.address);
        //const decimal = BigNumber.from(10).pow(18);
        await token.mint(BigNumber.from(1000).mul(decimal), {from: Accounts[1].address});

        await token.connect(Accounts[1]).approve(
            core.address, 
            APPROVAL_AMOUNT_LENDING_POOL_CORE,
        );
        
        const depositAmount = BigNumber.from(1000).mul(decimal);

        await pool.connect(Accounts[1]).deposit(
            token.address, 
            depositAmount,
            '0'
        );
        
        await aToken.connect(Accounts[1]).transfer(Accounts[0].address, depositAmount);
        //现在能拿到atoken的地址了
        var otherAcBalance = await aToken.balanceOf(Accounts[1].address);
        var ownerBalance = await aToken.balanceOf(Accounts[0].address);

        expect(otherAcBalance.toString()).to.be.equal("0", "Invalid from balance after transfer");
        expect(ownerBalance.toString()).to.be.equal(depositAmount.toString(), "Invalid to balance after transfer");
    });

    it("User 1 redirects interest to user 2, transfers 500 DAI back to user 0", async function () {
        //const {Accounts, core, token, aToken, pool} = await loadFixture(init);

        await aToken.connect(Accounts[0]).redirectInterestStream(Accounts[2].address);

        const aTokenRedirected = BigNumber.from(1000).mul(decimal);

        const aTokenToTransfer = BigNumber.from(500).mul(decimal);

        const account2RedirectedBalanceBefore = await aToken.getRedirectedBalance(Accounts[2].address);
        expect(account2RedirectedBalanceBefore.toString()).to.be.equal(aTokenRedirected, "Invalid redirected balance for user 2 before transfer");

        await aToken.transfer(Accounts[1].address, aTokenToTransfer, {from: Accounts[0].address});

        const user2RedirectedBalanceAfter = await aToken.getRedirectedBalance(Accounts[2].address);
        const user0RedirectionAddress = await aToken.getInterestRedirectAddress(Accounts[0].address);

        expect(user2RedirectedBalanceAfter.toString()).to.be.equal(aTokenToTransfer, "Invalid redirected balance for user 2 after transfer");
        expect(user0RedirectionAddress.toString()).to.be.equal(Accounts[2].address, "Invalid redirection address for user 0");
    });

    it('User 1 transfers back to user 0', async function () {
        const aTokenToTransfer = BigNumber.from(500).mul(decimal);

        await aToken.connect(Accounts[1]).transfer(Accounts[0].address, aTokenToTransfer);

        const user2RedirectedBalanceAfter = await aToken.getRedirectedBalance(Accounts[2].address);

        const user0BalanceAfter = await aToken.balanceOf(Accounts[0].address);

        expect(user2RedirectedBalanceAfter.toString()).to.be.equal(user0BalanceAfter.toString(), "Invalid redirected balance for user 2 after transfer");

    });

    it("User 0 deposits 1 ETH and user tries to borrow, but the aTokens received as a transfer are not available as collateral (revert expected)", async function () {
        await pool.deposit(ETHEREUM_ADDRESS, BigNumber.from(1).mul(decimal), '0', {
            from: Accounts[0].address,
            value: BigNumber.from(1).mul(decimal)
        });
        
        await expect(pool.borrow(ETHEREUM_ADDRESS, BigNumber.from(decimal).div(10), RATEMODE.STABLE, "0", {from: Accounts[0].address})).to.be.revertedWith("The collateral balance is 0");
    });

    it("'User 1 sets the DAI as collateral and borrows, tries to transfer everything back to user 0 (revert expected)", async function () {
        await pool.setUserUseReserveAsCollateral(token.address, true, {from: Accounts[0].address});

        const aTokenTransfer = BigNumber.from(1000).mul(decimal);

        console.log(await core.getUserBasicReserveData(token.address, Accounts[0].address));
        console.log(await core.getReserveConfiguration(token.address));

        await pool.borrow(ETHEREUM_ADDRESS, BigNumber.from(decimal).div(10), RATEMODE.STABLE, "0", {from: Accounts[0].address});

        await expect(aToken.transfer(Accounts[1].address, aTokenTransfer, {from: Accounts[0]}), "Transfer cannot be allowed");
    });
});