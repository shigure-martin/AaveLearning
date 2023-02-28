/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-28 09:54:52
 * @LastEditors: Martin
 * @LastEditTime: 2023-02-28 14:20:09
 */
const { ethers } = require("hardhat");

describe("Deploy", function (){
    async function deployTester() {
        const [owner, otherAccount] = await ethers.getSigners();

        const CoreLibrary = await ethers.getContractFactory("CoreLibrary");
        ethers.getContractFactory("WadRayMath");

        const coreLibrary = await CoreLibrary.deploy();

        const Pool = await ethers.getContractFactory("LendingPool");
        const Core = await ethers.getContractFactory("LendingPoolCore", {
            libraries: {
                CoreLibrary: coreLibrary.address,
            },
        });
        const DataProvider = await ethers.getContractFactory("LendingPoolDataProvider", {
            libraries: {
                //CoreLibrary: coreLibrary.address,
            }
        });

        const pool = await Pool.deploy();
        const core = await Core.deploy();
        const dataProvider = await DataProvider.deploy();

        const AddressesProvider = await ethers.getContractFactory("LendingPoolAddressesProvider");
        const addressesProvider = await AddressesProvider.deploy();

        await addressesProvider.setLendingPool(pool.address);
        await addressesProvider.setLendingPoolCore(core.address);
        await addressesProvider.setLendingPoolDataProvider(dataProvider.address);

        console.log(pool.address);
        const result = await addressesProvider.getLendingPool();
        console.log(result);
    }

    describe("test", deployTester);
});