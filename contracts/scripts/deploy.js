const hre = require("hardhat");

async function main() {
  console.log("开始部署 FGOGame 合约...");
  
  const FGOGame = await hre.ethers.getContractFactory("FGOGame");
  const game = await FGOGame.deploy();
  
  await game.waitForDeployment();
  
  const address = await game.getAddress();
  console.log("✅ FGOGame 合约已部署到:", address);
  console.log("\n请将以下地址保存到配置文件中：");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log("\n部署者地址:", (await hre.ethers.getSigners())[0].address);
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
