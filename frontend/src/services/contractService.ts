import { ethers } from 'ethers';

// Fallback Human-Readable ABI (used if VITE_CONTRACT_ABI is not set in .env)
const DEFAULT_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "string", "name": "did", "type": "string" }], "name": "DIDRegistered", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }, { "indexed": true, "internalType": "address", "name": "holder", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "issuedAt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "expiryDate", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "string", "name": "experience", "type": "string" }], "name": "CredentialIssued", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }], "name": "CredentialRevoked", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "bytes32", "name": "documentHash", "type": "bytes32" }, { "indexed": false, "internalType": "uint256", "name": "validFrom", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "validTo", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "organizationName", "type": "string" }], "name": "DocumentRegistered", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }], "name": "IssuerAuthorized", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }], "name": "IssuerRevoked", "type": "event" },
  { "inputs": [{ "internalType": "address", "name": "issuer", "type": "address" }], "name": "authorizeIssuer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "authorizedIssuers", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "didRegistry", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }], "name": "getHolderCredentials", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "issuer", "type": "address" }], "name": "getIssuerCredentials", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "bytes32", "name": "documentHash", "type": "bytes32" }], "name": "isDocumentRegistered", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" }, { "internalType": "uint256", "name": "expiryDate", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "experience", "type": "string" }], "name": "issueCredential", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "string", "name": "did", "type": "string" }], "name": "registerDID", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "bytes32", "name": "documentHash", "type": "bytes32" }, { "internalType": "uint256", "name": "validFrom", "type": "uint256" }, { "internalType": "uint256", "name": "validTo", "type": "uint256" }, { "internalType": "string", "name": "organizationName", "type": "string" }], "name": "registerDocument", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" }], "name": "revokeCredential", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "issuer", "type": "address" }], "name": "revokeIssuer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" }], "name": "verifyCredential", "outputs": [{ "internalType": "bool", "name": "exists", "type": "bool" }, { "internalType": "bool", "name": "revoked", "type": "bool" }, { "internalType": "bool", "name": "expired", "type": "bool" }, { "internalType": "address", "name": "issuer", "type": "address" }, { "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "uint256", "name": "issuedAt", "type": "uint256" }, { "internalType": "uint256", "name": "expiryDate", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "experience", "type": "string" }], "stateMutability": "view", "type": "function" }
];

// Load ABI from environment or use default
const getABI = () => {
  const envAbi = import.meta.env.VITE_CONTRACT_ABI;
  if (!envAbi || envAbi === '[]' || envAbi === '') {
    return DEFAULT_ABI;
  }
  try {
    return JSON.parse(envAbi);
  } catch (e) {
    console.warn("Failed to parse VITE_CONTRACT_ABI from .env, falling back to default ABI.", e);
    return DEFAULT_ABI;
  }
};

const CONTRACT_ABI = getABI();

// Contract address - Update this with your deployed contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

// Helper to get contract instance with either provider (read-only) or signer (write)
const getContract = (runner: ethers.ContractRunner) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured. Please set VITE_CONTRACT_ADDRESS in your environment variables.');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
};

// DID Registry Functions
export const registerDID = async (did: string, signer: ethers.JsonRpcSigner) => {
  const contract = getContract(signer);
  const tx = await contract.registerDID(did);
  return await tx.wait();
};

export const getDID = async (address: string, provider: ethers.BrowserProvider) => {
  const contract = getContract(provider);
  return await contract.didRegistry(address);
};

// Issuer Authorization Functions
export const authorizeIssuer = async (issuer: string, signer: ethers.JsonRpcSigner) => {
  const contract = getContract(signer);
  const normalizedIssuer = ethers.getAddress(issuer);
  const tx = await contract.authorizeIssuer(normalizedIssuer);
  return await tx.wait();
};

export const revokeIssuer = async (issuer: string, signer: ethers.JsonRpcSigner) => {
  const contract = getContract(signer);
  const tx = await contract.revokeIssuer(issuer);
  return await tx.wait();
};

export const isAuthorizedIssuer = async (address: string, provider: ethers.BrowserProvider | ethers.JsonRpcProvider) => {
  const contract = getContract(provider);
  const normalizedAddress = ethers.getAddress(address);
  return await contract.authorizedIssuers(normalizedAddress);
};

/** Returns the contract owner address. Only the owner can call authorizeIssuer/revokeIssuer. */
export const getContractOwner = async (provider: ethers.BrowserProvider | ethers.JsonRpcProvider): Promise<string> => {
  const contract = getContract(provider);
  const owner = await contract.owner();
  return ethers.getAddress(owner);
};

/**
 * Auto-authorize issuer for hackathon/demo purposes
 * Checks if the issuer is authorized, if not, attempts to authorize them
 * @param issuerAddress - Address to authorize
 * @param signer - Signer (must be contract owner)
 * @returns true if already authorized or successfully authorized
 */
export const ensureIssuerAuthorized = async (
  issuerAddress: string,
  signer: ethers.JsonRpcSigner
): Promise<boolean> => {
  try {
    const provider = signer.provider as ethers.BrowserProvider;
    const contract = getContract(provider);
    const normalizedAddress = ethers.getAddress(issuerAddress);
    
    // Check if already authorized
    const isAuthorized = await contract.authorizedIssuers(normalizedAddress);
    if (isAuthorized) {
      console.log(`[AUTO-AUTH] ${normalizedAddress} is already authorized`);
      return true;
    }

    console.log(`[AUTO-AUTH] Attempting to auto-authorize ${normalizedAddress}...`);
    
    // Check if signer is contract owner or authorized issuer
    const signerAddress = await signer.getAddress();
    const owner = await contract.owner();
    const signerIsOwner = ethers.getAddress(signerAddress) === ethers.getAddress(owner);
    const signerIsAuthorized = await contract.authorizedIssuers(ethers.getAddress(signerAddress));
    
    if (!signerIsOwner && !signerIsAuthorized) {
      console.warn(`[AUTO-AUTH] Signer ${signerAddress} is not owner or authorized issuer. Cannot authorize.`);
      return false;
    }
    
    // Try to authorize (will work if signer is owner or authorized issuer)
    const contractWithSigner = getContract(signer);
    const tx = await contractWithSigner.authorizeIssuer(normalizedAddress);
    await tx.wait();
    
    console.log(`[AUTO-AUTH] Successfully authorized ${normalizedAddress}`);
    return true;
  } catch (error: any) {
    console.warn(`[AUTO-AUTH] Could not auto-authorize: ${error.message}`);
    return false;
  }
};

// Credential Management Functions
export const issueCredential = async (
  holder: string,
  credentialHash: string,
  expiryDate: number,
  name: string,
  experience: string,
  signer: ethers.JsonRpcSigner
) => {
  const normalizedHolder = ethers.getAddress(holder);
  if (normalizedHolder.toLowerCase() === CONTRACT_ADDRESS?.toLowerCase()) {
    throw new Error('Holder cannot be the contract address. Use the recipient\'s wallet address.');
  }
  const contract = getContract(signer);
  const tx = await contract.issueCredential(normalizedHolder, credentialHash, expiryDate, name, experience);
  return await tx.wait();
};

export const registerDocument = async (
  documentHash: string,
  validFrom: number,
  validTo: number,
  organizationName: string,
  signer: ethers.JsonRpcSigner
) => {
  const contract = getContract(signer);
  const tx = await contract.registerDocument(documentHash, validFrom, validTo, organizationName);
  return await tx.wait();
};

export const revokeCredential = async (credentialHash: string, signer: ethers.JsonRpcSigner) => {
  const contract = getContract(signer);
  const tx = await contract.revokeCredential(credentialHash);
  return await tx.wait();
};

export const verifyCredential = async (credentialHash: string, provider: ethers.BrowserProvider | ethers.JsonRpcProvider) => {
  const contract = getContract(provider);
  console.log(`[DEBUG] On-Chain Verification Start`);
  console.log(`[DEBUG] Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`[DEBUG] Target Hash: ${credentialHash}`);

  try {
    const network = await provider.getNetwork();
    console.log(`[DEBUG] Network: ${network.name} (ChainID: ${network.chainId})`);

    // Check if contract code exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === "0x" || code === "0x0" || code.length <= 2) {
      console.error(`%c [ERROR] NO CONTRACT CODE FOUND AT ${CONTRACT_ADDRESS}`, "color: white; background: red; font-size: 20px; font-weight: bold;");
      throw new Error(`CRITICAL: The address ${CONTRACT_ADDRESS} is NOT a contract on this network! You likely copied your personal wallet address instead of the Contract address.`);
    }
    console.log(`[DEBUG] Bytecode length: ${code.length}`);

    // Verify if verifyCredential selector exists in code (0x40054053)
    if (!code.includes("40054053")) {
      console.warn("[DEBUG] WARNING: Function selector 'verifyCredential(bytes32)' (0x40054053) NOT found in contract bytecode!");
    } else {
      console.log("[DEBUG] Function selector found in bytecode.");
    }

    // Try RAW call to see what the hex result is
    const iface = new ethers.Interface(CONTRACT_ABI);
    const data = iface.encodeFunctionData("verifyCredential", [credentialHash]);
    const tx = { to: CONTRACT_ADDRESS, data: data };
    const rawResult = await provider.call(tx);
    console.log(`[DEBUG] Raw Hex Result: ${rawResult}`);

    if (rawResult === "0x") {
      throw new Error("CRITICAL: Contract returned 0x (Empty Data). This usually means the function doesn't exist on this contract or the address is wrong.");
    }

  } catch (e: any) {
    console.error(`[DEBUG] Diagnostic Check Failed: ${e.message}`);
    if (e.message.includes("CRITICAL")) throw e;
  }

  return await contract.verifyCredential(credentialHash);
};

export const getHolderCredentials = async (holder: string, provider: ethers.BrowserProvider) => {
  const contract = getContract(provider);
  return await contract.getHolderCredentials(holder);
};

export const getIssuerCredentials = async (issuer: string, provider: ethers.BrowserProvider | ethers.JsonRpcProvider) => {
  const contract = getContract(provider);
  console.log(`[DEBUG] Fetching Issued Credentials for: ${issuer}`);
  const hashes = await contract.getIssuerCredentials(issuer);
  console.log(`[DEBUG] Found ${hashes?.length || 0} hashes on-chain.`);
  return hashes;
};

// Utility function to hash credential data
export const hashCredential = (data: string): string => {
  return ethers.keccak256(ethers.toUtf8Bytes(data));
};
