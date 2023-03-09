/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-28 09:54:52
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-08 15:59:11
 */

const { BigNumber } = require("ethers");
const { ETHEREUM_ADDRESS } = require("../utils/constants");

var addressesProvider;

const envDeploy = async() => {
};

//Library Instance
const CoreLibraryInstance = async() => {
    const CoreLibrary = await ethers.getContractFactory("CoreLibrary");

    const coreLibrary = await CoreLibrary.deploy();

    return {coreLibrary};
};

//Contract Instance
const LendingPoolInstance = async() => {
    const Pool = await ethers.getContractFactory("LendingPool");
    
    const pool = await Pool.deploy();

    await addressesProvider.setLendingPool(pool.address);

    return pool;
};

const LendingPoolCoreInstance = async() => {
    const {coreLibrary} = await CoreLibraryInstance();

    const Core = await ethers.getContractFactory("LendingPoolCore", {
        libraries: {
            CoreLibrary: coreLibrary.address,
        },
    });

    const core = await Core.deploy();

    await addressesProvider.setLendingPoolCore(core.address);

    return core;
};

const DataProviderInstance = async() => {
    const DataProvider = await ethers.getContractFactory("LendingPoolDataProvider");

    const dataProvider = await DataProvider.deploy();

    await addressesProvider.setLendingPoolDataProvider(dataProvider.address);

    return dataProvider;
};

const AddressesProviderInstance = async(owner) => {
    const AddressesProvider = await ethers.getContractFactory("LendingPoolAddressesProvider");
    
    addressesProvider = await AddressesProvider.deploy();

    await addressesProvider.setLendingPoolManager(owner.address);

    // const {pool} = await LendingPoolInstance();
    // const {core} = await LendingPoolCoreInstance();
    // const {dataProvider} = await DataProviderInstance();

    // await addressesProvider.setLendingPool(pool.address);
    // await addressesProvider.setLendingPoolCore(core.address);
    // await addressesProvider.setLendingPoolDataProvider(dataProvider.address);

    return {addressesProvider};
};

const ATokenInstance = async(address) => {
    // const { addressesProvider } = await AddressesProviderInstance();
    
    const AToken = await ethers.getContractFactory("AToken");
    // const _aDai = await AToken.deploy(
    //     addressesProvider.address,
    //     _underlyingAsset,
    //     _name,
    //     _symbol
    // );
    const aToken = AToken.attach(address);
    return {aToken}; 
};

const TokenInstance = async(deployer, name, symbol) => {
    const Token = await ethers.getContractFactory("DAItest");

    const Token_new = await Token.connect(deployer);
    const token = await Token_new.deploy(name, symbol);
    await token.deployed();
    
    return token;
}

const PoolConfiguratorInstance = async() => {
    const Configurator = await ethers.getContractFactory("LendingPoolConfigurator");

    const poolConfigurator = await Configurator.deploy();

    await addressesProvider.setLendingPoolConfigurator(poolConfigurator.address);

    await poolConfigurator.initialize(addressesProvider.address);

    return {poolConfigurator};
};

const InterestRateStrategyInstance = async(reserve) => {
    const Strategy = await ethers.getContractFactory("DefaultReserveInterestRateStrategy");

    const ray = BigNumber.from(10).pow(27);
    const baseVariableBorrowRate = BigNumber.from(3).mul(ray);
    const variableRateSlope1 = BigNumber.from(5).mul(ray);
    const variableRateSlope2 = BigNumber.from(8).mul(ray);
    const stableRateSlope1 = BigNumber.from(5).mul(ray);
    const stableRateSlope2 = BigNumber.from(8).mul(ray);

    const strategy = await Strategy.deploy(
        reserve,
        addressesProvider.address,
        baseVariableBorrowRate,
        variableRateSlope1,
        variableRateSlope2,
        stableRateSlope1,
        stableRateSlope2
    );
    await strategy.deployed();

    await LendingRateOracleInstance(reserve);

    return strategy;
}

const LendingRateOracleInstance = async(_asset) => {
    const Oracle = await ethers.getContractFactory("LendingRateOracle");
    const oracle = await Oracle.deploy();

    const ray = BigNumber.from(10).pow(27);
    const rate = BigNumber.from(25).mul(ray);

    await oracle.setMarketBorrowRate(_asset, rate);
    addressesProvider.setLendingRateOracle(oracle.address);
}

const PriceOracleInstance = async(token) => {
    const decimal = BigNumber.from(10).pow(18);
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();

    await addressesProvider.setPriceOracle(priceOracle.address);

    await priceOracle.setAssetPrice(ETHEREUM_ADDRESS, BigNumber.from(decimal));
    await priceOracle.setAssetPrice(token.address, BigNumber.from(10).mul(decimal));
}

const FeeProviderInstance = async() => {
    const FeeProvider = await ethers.getContractFactory("FeeProvider");
    const feeProvider = await FeeProvider.deploy();
    await feeProvider.initialize(addressesProvider.address);

    await addressesProvider.setFeeProvider(feeProvider.address);
}

const ParametersProviderInstance = async() => {
    const ParametersProvider = await ethers.getContractFactory("LendingPoolParametersProvider");
    const parametersProvider = await ParametersProvider.deploy();

    await addressesProvider.setLendingPoolParametersProvider(parametersProvider.address);
}

module.exports = {
    LendingPoolInstance,
    LendingPoolCoreInstance,
    DataProviderInstance,
    AddressesProviderInstance,
    ATokenInstance,
    TokenInstance,
    PoolConfiguratorInstance,
    InterestRateStrategyInstance,
    PriceOracleInstance,
    FeeProviderInstance,
    ParametersProviderInstance
};