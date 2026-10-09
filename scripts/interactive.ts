
import { network } from "hardhat";
import * as fs from "node:fs";
import * as path from "node:path";
import readline from "node:readline";
import { formatEther, parseEther } from "viem";

async function main() {
    console.log("======================================");
    console.log("       DCF TERMINAL INTERACTION");
    console.log("======================================");

    // Connect to the configured Sepolia network
    const { viem } = await network.create("sepolia");

    const publicClient = await viem.getPublicClient();
    const [wallet] = await viem.getWalletClients();

    if (!wallet) {
        throw new Error("No wallet configured.");
    }

    console.log("\nConnected to Sepolia");
    console.log(`Your wallet: ${wallet.account.address}`);

    // Read the latest deployment
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
        deploymentData.versions?.[latestVersion]?.address;

    if (!contractAddress) {
        throw new Error("Latest contract address not found.");
    }

    console.log(`Contract version: ${latestVersion}`);
    console.log(`Contract address: ${contractAddress}`);

    const contract = await viem.getContractAt(
        "DCF",
        contractAddress
    );

    const owner = await contract.read.owner();

    console.log(`Contract owner: ${owner}`);

    const isOwner =
        owner.toLowerCase() ===
        wallet.account.address.toLowerCase();

    console.log(
        isOwner
            ? "\nYou are the contract owner."
            : "\nYou are not the contract owner."
    );

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    function ask(question: string): Promise<string> {
        return new Promise((resolve) => {
            rl.question(question, resolve);
        });
    }

    const validAddress = (address: string) =>
        /^0x[a-fA-F0-9]{40}$/.test(address);

    async function waitForTransaction(hash: `0x${string}`) {
        console.log(`Transaction hash: ${hash}`);
        console.log("Waiting for confirmation...");

        const receipt =
            await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status !== "success") {
            throw new Error("Transaction reverted.");
        }

        console.log("Transaction confirmed.");
    }

    while (true) {
        console.log("\n======================================");
        console.log("              DCF MENU");
        console.log("======================================");
        console.log("1. Check owner");
        console.log("2. Add authorized person");
        console.log("3. Remove authorized person");
        console.log("4. Check authorization");
        console.log("5. Call restricted function");
        console.log("6. Deposit ETH");
        console.log("7. View my deposits");
        console.log("8. View total deposits");
        console.log("9. View contract ETH balance");
        console.log("10. View deposits of an address");
        console.log("11. Exit");
        console.log("======================================");

        const choice = (await ask("Enter your choice: ")).trim();

        try {
            if (choice === "1") {
                console.log("Contract owner:", await contract.read.owner());
            }

            else if (choice === "2") {
                if (!isOwner) {
                    console.log("Only the owner can add people.");
                    continue;
                }

                const person = (await ask("Address to ADD: ")).trim();

                if (!validAddress(person)) {
                    console.log("Invalid Ethereum address.");
                    continue;
                }

                const hash = await contract.write.addPerson(
                    [person as `0x${string}`],
                    { account: wallet.account }
                );

                await waitForTransaction(hash);

                console.log(
                    "Authorized:",
                    await contract.read.isAuthorized([
                        person as `0x${string}`,
                    ])
                );
            }

            else if (choice === "3") {
                if (!isOwner) {
                    console.log("Only the owner can remove people.");
                    continue;
                }

                const person = (await ask("Address to REMOVE: ")).trim();

                if (!validAddress(person)) {
                    console.log("Invalid Ethereum address.");
                    continue;
                }

                const hash = await contract.write.removePerson(
                    [person as `0x${string}`],
                    { account: wallet.account }
                );

                await waitForTransaction(hash);

                console.log(
                    "Authorized:",
                    await contract.read.isAuthorized([
                        person as `0x${string}`,
                    ])
                );
            }

            else if (choice === "4") {
                const person = (
                    await ask("Address to check: ")
                ).trim();

                if (!validAddress(person)) {
                    console.log("Invalid Ethereum address.");
                    continue;
                }

                const status = await contract.read.isAuthorized([
                    person as `0x${string}`,
                ]);

                console.log(
                    status ? "Person is AUTHORIZED." : "Person is NOT AUTHORIZED."
                );
            }

            else if (choice === "5") {
                const result = await contract.read.restrictedFunction({
                    account: wallet.account,
                });

                console.log("Result:", result);
            }

            else if (choice === "6") {
                const amount = (
                    await ask("Amount to deposit in ETH (e.g. 0.01): ")
                ).trim();

                if (!/^\d+(\.\d+)?$/.test(amount)) {
                    console.log("Enter a valid positive ETH amount.");
                    continue;
                }

                const value = parseEther(amount);

                if (value <= 0n) {
                    console.log("Amount must be greater than zero.");
                    continue;
                }

                // Check permission before submitting the transaction.
                const authorized = await contract.read.isAuthorized([
                    wallet.account.address,
                ]);

                if (!isOwner && !authorized) {
                    console.log(
                        "Deposit denied: your wallet is not authorized."
                    );
                    continue;
                }

                const hash = await contract.write.deposit({
                    account: wallet.account,
                    value,
                });

                await waitForTransaction(hash);

                console.log(`Deposited ${formatEther(value)} ETH successfully.`);
            }

            else if (choice === "7") {
                const amount = await contract.read.getMyDeposits({
                    account: wallet.account,
                });

                console.log(`Your recorded deposits: ${formatEther(amount)} ETH`);
            }

            else if (choice === "8") {
                const total = await contract.read.getTotalDeposited();

                console.log(`Total recorded deposits: ${formatEther(total)} ETH`);
            }

            else if (choice === "9") {
                const balance = await contract.read.getContractBalance();

                console.log(`Contract ETH balance: ${formatEther(balance)} ETH`);
            }

            else if (choice === "10") {
                const person = (
                    await ask("Wallet address to inspect: ")
                ).trim();

                if (!validAddress(person)) {
                    console.log("Invalid Ethereum address.");
                    continue;
                }

                const amount = await contract.read.getDepositsOf([
                    person as `0x${string}`,
                ]);

                console.log(`Recorded deposits: ${formatEther(amount)} ETH`);
            }

            else if (choice === "11") {
                console.log("Exiting DCF terminal...");
                break;
            }

            else {
                console.log("Invalid choice. Select 1-11.");
            }
        } catch (error) {
            console.log("Operation failed.");
            console.error(error);
        }
    }

    rl.close();
}

main().catch((error) => {
    console.error("ERROR:");
    console.error(error);
    process.exitCode = 1;
});
