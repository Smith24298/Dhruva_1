# DHRUVA - Decentralized Credential Verification System

DHRUVA is a blockchain-based platform for issuing, managing, and verifying academic and professional credentials. It leverages Ethereum (Sepolia testnet) for immutable record-keeping and IPFS/centralized storage for document management.

## 🌟 Features

-   **Startups/Organizations**: Issue tamper-proof credentials to users.
-   **Users**: Receive, view, and share credentials via secure links and QR codes.
-   **Verifiers**: Instantly verify the authenticity of any document using its unique hash.
-   **Decentralized Identity**: DID-based identity management for issuers and holders.
-   **Secure Storage**: Hybrid storage model ensuring data integrity and accessibility.

## 🛠 Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS, Vite
-   **Backend**: Node.js, Express, MongoDB
-   **Blockchain**: Solidity, Foundry/Hardhat, Ethers.js
-   **Network**: Sepolia Testnet

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18+)
-   MongoDB (Local or Atlas)
-   MetaMask Wallet

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/dhruva.git
    cd dhruva
    ```

2.  **Install Dependencies**

    *backend*
    ```bash
    cd backend
    npm install
    ```

    *frontend*
    ```bash
    cd ../frontend
    npm install
    ```

3.  **Environment Setup**

    *backend/.env*
    ```env
    MONGODB_URI=mongodb://localhost:27017/dhruva
    PORT=5000
    ```

    *frontend/.env*
    ```env
    VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
    VITE_API_URL=http://localhost:5000/api
    VITE_CONTRACT_ABI=[]
    ```

4.  **Run the Application**

    *Start Backend*
    ```bash
    cd backend
    npm run dev
    ```

    *Start Frontend*
    ```bash
    cd frontend
    npm run dev
    ```

## 📜 Smart Contract

The core logic resides in `contracts/DIDRegistry.sol`.
-   **Deploy**: Use Remix IDE or Foundry.
-   **ABIs**: The frontend uses a JSON ABI for robust interaction.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
