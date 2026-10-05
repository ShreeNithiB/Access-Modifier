import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("Starting managePeople script...");

    // 1. Connect to the Sepolia network using Hardhat 3 + Viem
    const { viem } = await network.create();
    const publicClient = await viem.getPublicClient();
    console.log("Connected to network via Viem");

    // 2. Read the latest DCF contract address from deployments/sepolia.json
    const deploymentFile = path.join(process.cwd(), "deployments", "sepolia.json");
    if (!fs.existsSync(deploymentFile)) {
        throw new Error("deployments/sepolia.json not found");
    }

    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
    const latestVersion = deploymentData.latestVersion;
    
    if (!latestVersion || !deploymentData.versions[latestVersion]) {
        throw new Error("No valid deployment found in sepolia.json");
    }

    const contractAddress = deploymentData.versions[latestVersion].address;
    console.log(`Using contract version: ${latestVersion}`);
    console.log(`Contract address: ${contractAddress}`);

    // 3. Get the deployed DCF contract
    const contract = await viem.getContractAt("DCF", contractAddress);

    // 4. Read and display the contract owner
    const owner = await contract.read.owner();
    console.log(`Contract owner: ${owner}`);

    // 5. Clearly marked variable for the PUBLIC wallet address
    // TODO: Replace this with the actual public wallet address you want to manage.
    const person = "0x0000000000000000000000000000000000000001"; // <-- YOUR PUBLIC WALLET HERE
    console.log(`Managing person: ${person}`);

    // 6. Call addPerson(person)
    console.log("Adding person...");
    const addTxHash = await contract.write.addPerson([person as `0x${string}`]);
    console.log(`Add transaction submitted. Hash: ${addTxHash}`);

    // 7. Wait for the transaction to complete
    console.log("Waiting for add transaction to be confirmed...");
    await publicClient.waitForTransactionReceipt({ hash: addTxHash });
    console.log("Add transaction confirmed!");

    // 8. Check isAuthorized(person) and display the result
    const isAuthorizedAfterAdd = await contract.read.isAuthorized([person as `0x${string}`]);
    console.log(`Is authorized after adding: ${isAuthorizedAfterAdd}`);

    // 9. Call removePerson(person)
    console.log("Removing person...");
    const removeTxHash = await contract.write.removePerson([person as `0x${string}`]);
    console.log(`Remove transaction submitted. Hash: ${removeTxHash}`);

    // 10. Wait for the transaction to complete
    console.log("Waiting for remove transaction to be confirmed...");
    await publicClient.waitForTransactionReceipt({ hash: removeTxHash });
    console.log("Remove transaction confirmed!");

    // 11. Check isAuthorized(person) again and display the result
    const isAuthorizedAfterRemove = await contract.read.isAuthorized([person as `0x${string}`]);
    console.log(`Is authorized after removing: ${isAuthorizedAfterRemove}`);

    console.log("managePeople script completed successfully.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
