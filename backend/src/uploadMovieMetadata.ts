import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
import readlineSync from 'readline-sync';

// IPFS and Firefly API URLs
const IPFS_URL = 'http://localhost:10206/api/v0/add';
const FIREFLY_API_URL = 'http://localhost:5000/api/v1/namespaces/default/apis/Movie-Meter';

// Function to upload movie metadata to IPFS and chain
async function uploadMovieMetadata(contractOwnerAddress: any) {
    // 2. Upload Metadata to IPFS
    console.error("");
    const metadataFilePath = readlineSync.question('Enter the path to the metadata file: ');
    if (!fs.existsSync(metadataFilePath)) {
        console.error("The provided file path does not exist!");
        return;
    }
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

        // 3. Upload the IPFS hash to the chain
        console.error("");
        const movieTitle = readlineSync.question('Enter the movie title: ');
        const fireflyPayload = {
            input: {
                _ipfsHash: ipfsHash,
                _title: movieTitle,
            },
            key: contractOwnerAddress,
            options: {}
        };

        const fireflyResponse = await axios.post(`${FIREFLY_API_URL}/invoke/addMovie`, fireflyPayload, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const address = fireflyResponse.data?.input?.location?.address;
        console.log(`Movie uploaded to blockchain, at address: ${address}`);
    } catch (error) {
        console.error("Error adding Movie:", error);
    }
}

export default uploadMovieMetadata;
