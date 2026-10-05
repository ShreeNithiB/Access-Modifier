import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("Starting deployment...");
    const { viem } = await network.create();
    const walletClients = await viem.getWalletClients();
    const deployer = walletClients[0];
    
    console.log("Deploying contract with account:", deployer.account.address);

    const dcf = await viem.deployContract("DCF");

    console.log("DCF contract deployed to:", dcf.address);

    const owner = await dcf.read.owner();
    console.log("Contract owner:", owner);

    // Version tracking
    const deploymentsDir = path.join(process.cwd(), "deployments");
    const deploymentFilePath = path.join(deploymentsDir, "sepolia.json");
    
    let deploymentData = {
        network: "sepolia",
        contractName: "DCF",
        latestVersion: "v0",
        versions: {} as Record<string, { address: string, owner: string, deployedAt: string }>
    };

    if (fs.existsSync(deploymentFilePath)) {
        const fileContent = fs.readFileSync(deploymentFilePath, "utf-8");
        try {
            deploymentData = JSON.parse(fileContent);
        } catch (e) {
            console.error("Error parsing deployments file, starting fresh.");
        }
    }

    const currentVersionNum = parseInt(deploymentData.latestVersion.replace("v", ""));
    const nextVersionNum = isNaN(currentVersionNum) ? 1 : currentVersionNum + 1;
    const nextVersion = `v${nextVersionNum}`;

    deploymentData.latestVersion = nextVersion;
    if (!deploymentData.versions) {
        deploymentData.versions = {};
    }

    deploymentData.versions[nextVersion] = {
        address: dcf.address,
        owner: owner,
        deployedAt: new Date().toISOString()
    };

    const dir = path.dirname(deploymentFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentData, null, 2));
    
    console.log(`Deployment recorded as ${nextVersion} in deployments/sepolia.json`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
