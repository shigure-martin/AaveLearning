/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-28 09:54:52
 * @LastEditors: Martin
 * @LastEditTime: 2023-03-01 11:08:48
 */

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

    return {core};
};

const DataProviderInstance = async() => {
    const DataProvider = await ethers.getContractFactory("LendingPoolDataProvider");

    const dataProvider = await DataProvider.deploy();

    return {dataProvider};
};

const AddressesProviderInstance = async() => {
    const AddressesProvider = await ethers.getContractFactory("LendingPoolAddressesProvider");
    
    const addressesProvider = await AddressesProvider.deploy();

    const {pool} = await LendingPoolInstance();
    const {core} = await LendingPoolCoreInstance();
    const {dataProvider} = await DataProviderInstance();

    await addressesProvider.setLendingPool(pool.address);
    await addressesProvider.setLendingPoolCore(core.address);
    await addressesProvider.setLendingPoolDataProvider(dataProvider.address);

    //return {addressesProvider};
};

module.exports = {
    LendingPoolInstance,
    LendingPoolCoreInstance,
    DataProviderInstance,
    AddressesProviderInstance,
};