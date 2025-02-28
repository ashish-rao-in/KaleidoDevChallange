import * as readlineSync from 'readline-sync';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const predefinedPassword = process.env.SECRET_PASSWORD || 'defaultpassword';

// Encrypt function
function encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(predefinedPassword).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return iv.toString('hex') + ':' + encryptedData;
}

export async function encryptSecretKey(): Promise<string> {
    console.log(`
             --
         ---|--|---------------
        |          --    [  ]  |
        |       ((    ))       |
        |          --          |
         ----------------------
    `);

    console.error("      ADD MOVIE (VERSION 2) APPLICATION CONSOLE:");
    const secretKey = readlineSync.question('Enter your secret key: ', {
        hideEchoBack: true,
    });

    // Encrypt the secret key and return the encrypted string
    return encrypt(secretKey);
}





/*
import { ethers } from 'hardhat';
import readlineSync from 'readline-sync';

// Function for authenticating the user
async function userAuthentication(): Promise<string> {
    // Prompt the user for their private key securely
    console.log(`
        --
     --|--|---------------
    |          --    [  ]  |
    |       ((    ))       |
    |         --           |
     ---------------------
    `);

    console.error("      ADD MOVIE APPLICATION CONSOLE:");
    const PRIVATE_KEY = readlineSync.question('Enter your private key: ', {
        hideEchoBack: true, // This hides the private key while typing
    });

    if (!PRIVATE_KEY || PRIVATE_KEY.length === 0) {
        console.error("Private key is required!");
        process.exit(1);
    }

    // Initialize signer with the provided private key
    const signer = new ethers.Wallet(PRIVATE_KEY);

    // Verify the signer is the contract owner
    const [contractOwner] = await ethers.getSigners();
    if (signer.address !== contractOwner.address) {
        console.error("You are not the owner of the contract!");
        process.exit(1);
    }

    console.log(`Verified:`);
    console.log(`The contract owner is             : ${contractOwner.address}`);
    console.log(`Signer address (using private key): ${signer.address}`);

    return signer.address;
}
*/

