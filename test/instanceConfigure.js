/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-03-09 16:05:51
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-09 16:20:21
 */

const { ethers } = require("hardhat");
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
    PriceOracleInstance,
    FeeProviderInstance,
    ParametersProviderInstance
} = require("./testEnvProvider");

const instancesConfig = async(Accounts) => {
    //create of instances
    const { addressesProvider } = await AddressesProviderInstance(Accounts[0]);
    core = await LendingPoolCoreInstance();
    pool = await LendingPoolInstance();
    token = await TokenInstance(Accounts[1], "dai", "DAI");
    dataProvider = await DataProviderInstance();
    const strategyOfToken = await InterestRateStrategyInstance(token.address);
    const strategyOfEth = await InterestRateStrategyInstance(ETHEREUM_ADDRESS);
    const { poolConfigurator } = await PoolConfiguratorInstance();
    await PriceOracleInstance(token);
    await FeeProviderInstance();
    await ParametersProviderInstance();

    //configuration of instances
    await pool.initialize(addressesProvider.address);
    await core.initialize(addressesProvider.address);
    await dataProvider.initialize(addressesProvider.address);

    await poolConfigurator.refreshLendingPoolCoreConfiguration();
    await poolConfigurator.initReserve(token.address, 18, strategyOfToken.address);
    await poolConfigurator.enableReserveAsCollateral(token.address, 80, 20, 3);
    await poolConfigurator.initReserveWithData(ETHEREUM_ADDRESS, "Aave Interest bearing ETH", "aETH", 18, strategyOfEth.address);
    await poolConfigurator.enableBorrowingOnReserve(ETHEREUM_ADDRESS, true);

    var reserve = await core.getReserveData(token.address);
    aToken = await (await ATokenInstance(reserve.aTokenAddress)).aToken;

    return {core, token, aToken, pool};
}

module.exports = {
    instancesConfig,
}
