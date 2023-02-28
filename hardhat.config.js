/*
 * @Description: 
 * @Author: Martin
 * @Date: 2023-02-14 15:09:04
 * @LastEditors: Martin
 * @LastEditTime: 2023-02-28 10:38:15
 */
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  
};
