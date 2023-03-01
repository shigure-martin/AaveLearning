/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-28 09:54:52
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-01 16:40:44
 */

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

    return {pool};
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

    return {core};
};

const DataProviderInstance = async() => {
    const DataProvider = await ethers.getContractFactory("LendingPoolDataProvider");

    const dataProvider = await DataProvider.deploy();

    await addressesProvider.setLendingPoolDataProvider(dataProvider.address);

    return {dataProvider};
};

const AddressesProviderInstance = async() => {
    const AddressesProvider = await ethers.getContractFactory("LendingPoolAddressesProvider");
    
    addressesProvider = await AddressesProvider.deploy();

    // const {pool} = await LendingPoolInstance();
    // const {core} = await LendingPoolCoreInstance();
    // const {dataProvider} = await DataProviderInstance();

    // await addressesProvider.setLendingPool(pool.address);
    // await addressesProvider.setLendingPoolCore(core.address);
    // await addressesProvider.setLendingPoolDataProvider(dataProvider.address);

    return {addressesProvider};
};

const ATokenInstance = async() => {
    const { addressesProvider } = await AddressesProviderInstance();
    
    const AToken = await ethers.getContractFactory("AToken");
    const _aDai = await AToken.deploy(
        addressesProvider.address,
        ETHEREUM_ADDRESS,
        "wrapedETH",
        "WETH"
    );
    return {_aDai}; 
};

const TokenInstance = async(deployer, name, symbol) => {
    const Token = await ethers.getContractFactory("DAItest");

    const Token_new = await Token.connect(deployer);
    const token = await Token_new.deploy(name, symbol);
    
    return {token};
}

module.exports = {
    LendingPoolInstance,
    LendingPoolCoreInstance,
    DataProviderInstance,
    AddressesProviderInstance,
    ATokenInstance,
    TokenInstance,
};