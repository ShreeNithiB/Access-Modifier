# DCF — Decentralized Access Control Smart Contract

A Solidity-based decentralized access control system that provides **owner-controlled authorization management** using Ethereum smart contracts.

The project demonstrates how blockchain-based access control can be implemented using Solidity, Hardhat, Viem, and Ethereum Sepolia. The contract allows the owner to add or remove authorized wallet addresses and restrict sensitive functions to the contract owner.

---

## 📌 Project Overview

The **DCF (Decentralized Control Framework)** smart contract implements a simple and transparent access-control mechanism on the Ethereum blockchain.

The contract maintains:

- A designated contract owner
- A list of authorized Ethereum addresses
- Owner-only functions for adding and removing authorized users
- Restricted functions that can only be executed by the owner
- Automated test cases for both authorized and unauthorized operations

All access decisions are enforced directly by the smart contract using Solidity's `msg.sender` and a custom `onlyOwner` modifier.

---

## ✨ Features

### 🔐 Owner-Based Access Control

The address that deploys the contract becomes the owner.

```solidity
address public owner = msg.sender;
```

Only this address can perform administrative operations.

### 👤 Add Authorized Users

The owner can authorize an Ethereum address:

```solidity
addPerson(address person)
```

### 🚫 Remove Authorized Users

The owner can revoke an address's authorization:

```solidity
removePerson(address person)
```

### 🔎 Check Authorization

Anyone can check whether an address is authorized:

```solidity
isAuthorized(address person)
```

### 🛡️ Restricted Function

Sensitive operations can be restricted to the owner:

```solidity
restrictedFunction()
```

### 🧪 Automated Testing

The project includes automated test cases covering:

- Owner assignment
- Initial authorization state
- Adding users
- Removing users
- Owner-only functions
- Unauthorized access attempts
- Multiple authorized users
- Re-authorization after removal

---

## 🏗️ System Architecture

```text
                    Ethereum / Sepolia
                           │
                           ▼
                    ┌──────────────┐
                    │  DCF.sol     │
                    │ Smart        │
                    │ Contract     │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
         Owner        Authorized     Restricted
        Management      Users         Functions
             │             │             │
             └─────────────┴─────────────┘
                           │
                           ▼
                     Viem / Hardhat
                           │
                           ▼
                    Terminal Interface
```

---

## 🔑 Access Control Model

The contract uses the following logic:

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}
```

### How it works

When the contract is deployed:

```text
Deployer Wallet
      │
      ▼
  msg.sender
      │
      ▼
    owner
```

When a protected function is called:

```text
Caller Wallet
      │
      ▼
  msg.sender
      │
      ▼
Is msg.sender == owner?
      │
   ┌──┴──┐
  YES    NO
   │      │
   ▼      ▼
 Allow   Revert
```

The private key is never stored in the smart contract. The blockchain identifies the caller through the cryptographic signature of the transaction.

---

## 📂 Project Structure

```text
Bw-project-full/
│
├── contracts/
│   └── DCF.sol
│
├── scripts/
│   ├── interactive.ts
│   ├── managePeople.ts
│   └── send-op-tx.ts
│
├── test/
│   ├── DCF.ts
│   └── Counter.ts
│
├── deployments/
│   └── sepolia.json
│
├── hardhat.config.ts
├── package.json
├── package-lock.json
├── .gitignore
├── .npmignore
├── .env.example
└── README.md
```

> `node_modules`, `artifacts`, `cache`, `.env`, and other sensitive/generated files are excluded from version control.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **Solidity** | Smart contract development |
| **Ethereum** | Blockchain platform |
| **Sepolia** | Ethereum test network |
| **Hardhat** | Development, compilation and testing |
| **Viem** | Ethereum interaction and wallet management |
| **TypeScript** | Scripts and automated tests |
| **Node.js** | Runtime environment |
| **dotenv** | Environment variable management |
| **Git/GitHub** | Version control and source-code management |

---

## 📋 Smart Contract

The main contract is:

```text
contracts/DCF.sol
```

### Contract Functions

| Function | Access | Description |
|---|---|---|
| `owner()` | Public | Returns the contract owner |
| `addPerson(address)` | Owner only | Authorizes an address |
| `removePerson(address)` | Owner only | Removes authorization |
| `isAuthorized(address)` | Public | Checks authorization status |
| `restrictedFunction()` | Owner only | Demonstrates owner-restricted functionality |

---

## ⚙️ Prerequisites

Install the following before running the project:

- Node.js
- npm
- Git

Verify the installations:

```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/ShreeNithiB/Access-Modifier.git
```

Navigate into the project:

```bash
cd Access-Modifier
```

Install dependencies:

```bash
npm install
```

---

## 🔐 Environment Configuration

Create a `.env` file in the project root:

```env
SEPOLIA_RPC_URL="YOUR_SEPOLIA_RPC_URL"
SEPOLIA_PRIVATE_KEY="YOUR_PRIVATE_KEY"
```

Example structure:

```text
Project Root
│
├── .env
├── .env.example
├── hardhat.config.ts
└── ...
```

### ⚠️ Security

**Never commit `.env` to GitHub.**

The private key provides control over the wallet and must remain confidential.

The project `.gitignore` excludes `.env` from version control.

For other developers, `.env.example` can be used as a template.

---

## 🔨 Compile the Contract

Compile the Solidity contract using:

```bash
npx hardhat compile
```

A successful compilation confirms that the Solidity source code is syntactically and semantically valid.

---

## 🧪 Run Automated Tests

The project contains automated test cases in:

```text
test/DCF.ts
```

Run the tests using:

```bash
npx hardhat test
```

### Test Coverage

The test suite verifies:

1. Deployer becomes the contract owner
2. Addresses are unauthorized initially
3. Owner can add an address
4. Owner can remove an address
5. Owner can execute restricted functions
6. Non-owner cannot add an address
7. Non-owner cannot remove an address
8. Non-owner cannot execute restricted functions
9. Owner can authorize multiple addresses
10. An address can be authorized again after removal

Example expected result:

```text
10 passing
```

The exact number may vary depending on additional Hardhat starter tests included in the project.

---

## 🌐 Sepolia Deployment

The project is configured to interact with the Ethereum Sepolia test network.

The network configuration is defined in:

```text
hardhat.config.ts
```

The configuration uses:

```text
SEPOLIA_RPC_URL
SEPOLIA_PRIVATE_KEY
```

to connect to Sepolia and sign transactions.

### Deployment Concept

```text
Private Key
     │
     ▼
Wallet
     │
     ▼
Deployment Transaction
     │
     ▼
Ethereum Sepolia
     │
     ▼
DCF Smart Contract
```

Once deployed, the contract address is stored in:

```text
deployments/sepolia.json
```

---

## 👥 Managing Authorized Users

The interactive terminal script provides a simple interface for interacting with the deployed contract.

Run:

```bash
npx hardhat run scripts/interactive.ts --network sepolia
```

The terminal provides:

```text
========== MENU ==========

1. Check owner
2. Add person
3. Remove person
4. Check authorization
5. Restricted function
6. Exit

==========================
```

### Add a Person

Select:

```text
2
```

Then enter the Ethereum address that should be authorized.

The contract executes:

```solidity
addPerson(address)
```

### Remove a Person

Select:

```text
3
```

Then enter the Ethereum address to remove.

The contract executes:

```solidity
removePerson(address)
```

### Check Authorization

Select:

```text
4
```

Enter an address to check whether it is currently authorized.

---

## 🔒 Security Model

The project uses Solidity's `msg.sender` to identify the account that calls a function.

For owner-only operations:

```solidity
require(msg.sender == owner, "Not owner");
```

This ensures that unauthorized wallets cannot perform administrative operations.

### Important Security Principles

- Private keys are stored only in environment variables.
- Private keys are never stored on-chain.
- `.env` is excluded from Git.
- Owner-only operations are enforced inside the smart contract.
- Authorization state is stored on-chain.
- Unauthorized operations revert automatically.

---

## 🧪 Testing vs. Deployment

Testing and deployment serve different purposes.

### Automated Testing

```text
test/DCF.ts
      ↓
npx hardhat test
      ↓
Local test blockchain
      ↓
PASS / FAIL
```

Automated tests verify that the contract behaves correctly.

### Sepolia Interaction

```text
interactive.ts
      ↓
Wallet signs transaction
      ↓
Ethereum Sepolia
      ↓
Deployed DCF contract
```

The interactive script demonstrates the behavior of the actual deployed contract.

---

## 📊 Example Workflow

A typical development workflow is:

```text
1. Write Solidity contract
          ↓
2. Compile contract
          ↓
3. Write automated test cases
          ↓
4. Run npx hardhat test
          ↓
5. Deploy to Sepolia
          ↓
6. Store deployment information
          ↓
7. Interact using terminal
          ↓
8. Verify owner/access-control behavior
```

---

## 📝 Versioned Deployment Tracking

The project maintains deployment information in:

```text
deployments/sepolia.json
```

This allows the project to track different deployed versions of the DCF contract.

Example structure:

```json
{
  "network": "sepolia",
  "contractName": "DCF",
  "latestVersion": "v1",
  "versions": {
    "v1": {
      "address": "0x..."
    }
  }
}
```

Each new deployment can be recorded as a new version instead of overwriting the previous deployment information.

---

## 📁 Important Files

### `contracts/DCF.sol`

Contains the main Solidity smart contract and access-control logic.

### `test/DCF.ts`

Contains automated test cases for validating contract behavior.

### `scripts/interactive.ts`

Provides a terminal-based interface for interacting with the deployed contract.

### `hardhat.config.ts`

Contains Hardhat, Solidity compiler, plugin, and Sepolia network configuration.

### `deployments/sepolia.json`

Stores deployed contract addresses and deployment versions.

### `.env`

Stores sensitive environment configuration and must never be committed.

---

## ⚠️ Disclaimer

This project is developed for **educational and testing purposes** using the Ethereum Sepolia test network.


---

## 👨‍💻 Author

**Shree Nithi B**

GitHub:

`https://github.com/ShreeNithiB/ShreeNithiB`

Project Repository:

`https://github.com/ShreeNithiB/Access-Modifier`

---

## 📄 License

This project is licensed under the MIT License.
