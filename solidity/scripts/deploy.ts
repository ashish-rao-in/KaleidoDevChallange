import { ethers } from "hardhat";

async function main() {
  const MovieMeterFactory = await ethers.getContractFactory("MovieMeter");
  const movieMeter = await MovieMeterFactory.deploy();

  await movieMeter.deployed();

  console.log("Contracts deployed!\nAdd the addresses to backend/index.ts:");
  console.log(`MOVIE_METER_ADDRESS: ${movieMeter.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
