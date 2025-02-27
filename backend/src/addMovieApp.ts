import axios from 'axios';
import { ethers } from 'hardhat';
import * as fs from 'fs';
import FormData from "form-data";
import readlineSync from 'readline-sync';

const IPFS_URL = 'http://localhost:10206/api/v0/add';
const FIREFLY_API_URL = 'http://localhost:5000/api/v1/namespaces/default/apis/Movie-Meter'

async function main() {

    console.log(`
            --
         --|--|---------------
        |          --    [  ]  |
        |       ((    ))       |
        |         --           |
         ---------------------
    `);
  
  console.error("      ADD MOVIE APPLICATION CONSOLE:");
  console.error("");
  //P.S. : PRIVATE_KEY is 'bff99bc79d455ad172605ed3f51f71d943d61e5549f2c2ea8d7476a5be16acbd';
  const PRIVATE_KEY = readlineSync.question('Enter your private key: ');


  // 1. Verify that the user is owner of the contract
  const signer = new ethers.Wallet(PRIVATE_KEY);
  const [contractOwner] = await ethers.getSigners();
  if (signer.address !== contractOwner.address) {
    console.error("You are not the owner of the contract!");
    return;
  }
  console.log(`Verified: `);
  console.log(`The contract owner is             : ${contractOwner.address}`);
  console.log(`Signer address (using private key): ${signer.address}`);


  // 2. Upload Metadata to IPFS
  console.error("");
  const metadataFilePath = readlineSync.question('Enter the path to the metadata file: ');
  const fileBuffer = fs.readFileSync(metadataFilePath);
  try {
    const formData = new FormData();
    formData.append('file', fileBuffer, 'MovieMetadata.txt');

    const headers = formData.getHeaders();
    const response = await axios.post(IPFS_URL, formData, {
        headers: {
            ...headers,
            'Content-Length': formData.getLengthSync()
          },
    });

  const ipfsHash = response.data.Hash;
  console.log(`File uploaded to IPFS with hash: ${ipfsHash}`);


  //3. Upload the ipfs hash to the chain
  console.error("");
  const movieTitle = readlineSync.question('Enter the movie title: ');
  const fireflyPayload = {
    input: {
      _ipfsHash: ipfsHash,
      _title: movieTitle,
    },
    key: contractOwner.address,
    options: {}
  };

  const fireflyResponse = await axios.post(`${FIREFLY_API_URL}/invoke/addMovie`, fireflyPayload, {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  const address = fireflyResponse.data?.input?.location?.address;
  console.log(`Movie uploaded to the chain, at address: ${address}`);
} catch (error) {
    console.error("Error adding Movie:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
