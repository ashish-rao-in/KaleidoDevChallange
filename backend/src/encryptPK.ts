import * as fs from 'fs';
import * as readlineSync from 'readline-sync';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Encrypt the private key and store it in a file
function encryptAndStorePrivateKey(privateKey: string, secretKey: string) {
    const iv = crypto.randomBytes(16); // IV for encryption
    const key = crypto.createHash('sha256').update(secretKey).digest(); // Key from secretKey
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Store the encrypted private key and IV in a file
    const dataToStore = { encrypted, iv: iv.toString('hex') };
    fs.writeFileSync('encryptedPrivateKey.json', JSON.stringify(dataToStore), 'utf8');

    console.log("Private key encrypted and stored successfully!");
}

// Prompt the user for input
function getInput() {
    const privateKey = readlineSync.question('Please enter your private key: ',{
      hideEchoBack: true,
  });
    const secretKey = readlineSync.question('Please enter your secret key: ',{
      hideEchoBack: true,
  });
    
    encryptAndStorePrivateKey(privateKey, secretKey);
}

getInput();
