import { network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import readline from "readline";

async function main() {
    console.log("======================================");
    console.log("       DCF TERMINAL INTERACTION");
    console.log("======================================");

    // Connect to the network
    const { viem } = await network.create();

    const publicClient = await viem.getPublicClient();
    const [wallet] = await viem.getWalletClients();

    console.log("\nConnected to Sepolia");
    console.log(`Your wallet: ${wallet.account.address}`);

    // Read latest deployment
    const deploymentFile = path.join(
        process.cwd(),
        "deployments",
        "sepolia.json"
    );

    if (!fs.existsSync(deploymentFile)) {
        throw new Error("deployments/sepolia.json not found");
    }

    const deploymentData = JSON.parse(
        fs.readFileSync(deploymentFile, "utf-8")
    );

    const latestVersion = deploymentData.latestVersion;

    const contractAddress =
        deploymentData.versions[latestVersion].address;

    console.log(`Contract version: ${latestVersion}`);
    console.log(`Contract address: ${contractAddress}`);

    // Get contract
    const contract = await viem.getContractAt(
        "DCF",
        contractAddress
    );

    // Check owner
    const owner = await contract.read.owner();

    console.log(`Contract owner: ${owner}`);

    if (
        owner.toLowerCase() !==
        wallet.account.address.toLowerCase()
    ) {
        console.log("\nWARNING: Your wallet is NOT the owner.");
        console.log("You cannot add or remove people.");
    } else {
        console.log("\nYou are the contract owner.");
    }

    // Create terminal input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    function ask(question: string): Promise<string> {
        return new Promise((resolve) => {
            rl.question(question, resolve);
        });
    }

    while (true) {
        console.log("\n======================================");
        console.log("              MENU");
        console.log("======================================");
        console.log("1. Check owner");
        console.log("2. Add person");
        console.log("3. Remove person");
        console.log("4. Check authorization");
        console.log("5. Call restricted function");
        console.log("6. Exit");
        console.log("======================================");

        const choice = await ask("Enter your choice: ");

        // -----------------------------------------
        // 1. Check owner
        // -----------------------------------------
        if (choice === "1") {
            const currentOwner = await contract.read.owner();

            console.log("\nContract owner:");
            console.log(currentOwner);
        }

        // -----------------------------------------
        // 2. Add person
        // -----------------------------------------
        else if (choice === "2") {
            const person = await ask(
                "\nEnter the person's wallet address to ADD: "
            );

            if (!/^0x[a-fA-F0-9]{40}$/.test(person)) {
                console.log("\nInvalid Ethereum address.");
                continue;
            }

            try {
                console.log("\nAdding person...");

                const txHash = await contract.write.addPerson(
                    [person as `0x${string}`],
                    {
                        account: wallet.account,
                    }
                );

                console.log(`Transaction hash: ${txHash}`);
                console.log("Waiting for confirmation...");

                await publicClient.waitForTransactionReceipt({
                    hash: txHash,
                });

                console.log("Person added successfully!");

                const status =
                    await contract.read.isAuthorized([
                        person as `0x${string}`,
                    ]);

                console.log(`Authorized: ${status}`);
            } catch (error) {
                console.log("\nFailed to add person.");
                console.log(error);
            }
        }

        // -----------------------------------------
        // 3. Remove person
        // -----------------------------------------
        else if (choice === "3") {
            const person = await ask(
                "\nEnter the person's wallet address to REMOVE: "
            );

            if (!/^0x[a-fA-F0-9]{40}$/.test(person)) {
                console.log("\nInvalid Ethereum address.");
                continue;
            }

            try {
                console.log("\nRemoving person...");

                const txHash =
                    await contract.write.removePerson(
                        [person as `0x${string}`],
                        {
                            account: wallet.account,
                        }
                    );

                console.log(`Transaction hash: ${txHash}`);
                console.log("Waiting for confirmation...");

                await publicClient.waitForTransactionReceipt({
                    hash: txHash,
                });

                console.log("Person removed successfully!");

                const status =
                    await contract.read.isAuthorized([
                        person as `0x${string}`,
                    ]);

                console.log(`Authorized: ${status}`);
            } catch (error) {
                console.log("\nFailed to remove person.");
                console.log(error);
            }
        }

        // -----------------------------------------
        // 4. Check authorization
        // -----------------------------------------
        else if (choice === "4") {
            const person = await ask(
                "\nEnter the person's wallet address: "
            );

            if (!/^0x[a-fA-F0-9]{40}$/.test(person)) {
                console.log("\nInvalid Ethereum address.");
                continue;
            }

            const status =
                await contract.read.isAuthorized([
                    person as `0x${string}`,
                ]);

            console.log(
                `\nAuthorization status: ${status}`
            );

            if (status) {
                console.log("This person is AUTHORIZED.");
            } else {
                console.log("This person is NOT AUTHORIZED.");
            }
        }

        // -----------------------------------------
        // 5. Restricted function
        // -----------------------------------------
        else if (choice === "5") {
            try {
                const result =
                    await contract.read.restrictedFunction({
                        account: wallet.account,
                    });

                console.log(`\nResult: ${result}`);
            } catch (error) {
                console.log("\nAccess denied.");
                console.log("Only the owner can call this function.");
            }
        }

        // -----------------------------------------
        // 6. Exit
        // -----------------------------------------
        else if (choice === "6") {
            console.log("\nExiting...");
            rl.close();
            break;
        }

        else {
            console.log("\nInvalid choice. Please select 1-6.");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\nERROR:");
        console.error(error);
        process.exit(1);
    });