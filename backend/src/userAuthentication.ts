import * as crypto from 'crypto';
import dotenv from 'dotenv';
import { ethers } from 'hardhat';
import * as fs from 'fs';

dotenv.config();

const predefinedPassword = process.env.SECRET_PASSWORD || 'defaultpassword';

function decrypt(encryptedData: string): string {
    const [ivHex, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(predefinedPassword).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}

async function getPublicAddressFromPrivateKey(secretKey: Buffer): Promise<string> {
    const encryptedData = JSON.parse(fs.readFileSync('encryptedPrivateKey.json', 'utf8'));
    const { encrypted, iv } = encryptedData;
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));
    let privateKey = decipher.update(encrypted, 'hex', 'utf8');
    privateKey += decipher.final('utf8');

    const signer = new ethers.Wallet(privateKey);

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

export async function decryptAndGetPublicAddress(encryptedSecretKey: string): Promise<string> {
    const decryptedSecretKey = decrypt(encryptedSecretKey);
    const key = crypto.createHash('sha256').update(decryptedSecretKey).digest();

    // Derive and return the public address from the decrypted secret key
    const publicAddress = getPublicAddressFromPrivateKey(key);
    return publicAddress;
}