import { encryptSecretKey } from './encryptSK';
import { decryptAndGetPublicAddress } from './userAuthentication';
import uploadMovieMetadata from './uploadMovieMetadata';

async function main() {
    try {
        // 1. Get the Secret Key from user
        const encryptedSecretKey = await encryptSecretKey();

        // 2. Get the Public Key
        const contractOwnerAddress = await decryptAndGetPublicAddress(encryptedSecretKey);

        // 3. Upload Metadata to IPFS and Chain
        await uploadMovieMetadata(contractOwnerAddress);

    } catch (error) {
        console.error("An error occurred:", error);
        process.exit(1);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
