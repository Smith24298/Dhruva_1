
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DIDRegistry
 * @dev Registry for DIDs and Verifiable Credentials
 * @custom:dev-run-script script/Deploy.s.sol
 */
contract DIDRegistry {
    // State variables
    address public owner;
    mapping(address => string) public didRegistry;
    mapping(address => bool) public authorizedIssuers;

    struct Credential {
        address issuer;
        address holder;
        bytes32 credentialHash;
        uint256 issuedAt;
        uint256 expiryDate;
        bool revoked;
        string name;
        string experience;
    }

    mapping(bytes32 => Credential) private credentials;
    mapping(address => bytes32[]) private holderCredentials;
    mapping(address => bytes32[]) private issuerCredentials;

    // Events
    event DIDRegistered(address indexed user, string did);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    event CredentialIssued(
        bytes32 indexed credentialHash,
        address indexed issuer,
        address indexed holder,
        uint256 issuedAt,
        uint256 expiryDate,
        string name,
        string experience
    );
    event CredentialRevoked(bytes32 indexed credentialHash, address indexed issuer);
    event DocumentRegistered(address indexed owner, bytes32 indexed documentHash, uint256 validFrom, uint256 validTo, string organizationName);

    mapping(bytes32 => bool) private registeredDocuments;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Only authorized issuers can call this function");
        _;
    }

    modifier onlyOwnerOrAuthorizedIssuer() {
        require(
            msg.sender == owner || authorizedIssuers[msg.sender],
            "Only owner or authorized issuer can call this function"
        );
        _;
    }

    modifier onlyCredentialIssuer(bytes32 credentialHash) {
        Credential memory credential = credentials[credentialHash];
        require(credential.issuer != address(0), "Credential does not exist");
        require(credential.issuer == msg.sender, "Only the issuing organization can revoke this credential");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // DID Registry functions
    function registerDID(string memory did) external {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(bytes(didRegistry[msg.sender]).length == 0, "DID already registered for this address");

        didRegistry[msg.sender] = did;
        emit DIDRegistered(msg.sender, did);
    }

    // Issuer Authorization functions - owner or any authorized issuer can add/revoke issuers
    function authorizeIssuer(address issuer) external onlyOwnerOrAuthorizedIssuer {
        require(issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[issuer], "Issuer already authorized");

        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    function revokeIssuer(address issuer) external onlyOwnerOrAuthorizedIssuer {
        require(authorizedIssuers[issuer], "Issuer not authorized");

        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    // Credential functions
    function issueCredential(
        address holder,
        bytes32 credentialHash,
        uint256 expiryDate,
        string memory name,
        string memory experience
    ) external onlyAuthorizedIssuer {
        require(holder != address(0), "Invalid holder address");
        require(credentials[credentialHash].issuer == address(0), "Credential already exists");
        require(expiryDate > block.timestamp, "Expiry date must be in the future");

        credentials[credentialHash] = Credential({
            issuer: msg.sender,
            holder: holder,
            credentialHash: credentialHash,
            issuedAt: block.timestamp,
            expiryDate: expiryDate,
            revoked: false,
            name: name,
            experience: experience
        });

        holderCredentials[holder].push(credentialHash);
        issuerCredentials[msg.sender].push(credentialHash);
        emit CredentialIssued(credentialHash, msg.sender, holder, block.timestamp, expiryDate, name, experience);
    }

    function revokeCredential(bytes32 credentialHash) external onlyCredentialIssuer(credentialHash) {
        require(!credentials[credentialHash].revoked, "Credential already revoked");

        credentials[credentialHash].revoked = true;
        emit CredentialRevoked(credentialHash, msg.sender);
    }

    function verifyCredential(bytes32 credentialHash) public view returns (
        bool exists,
        bool revoked,
        bool expired,
        address issuer,
        address holder,
        uint256 issuedAt,
        uint256 expiryDate,
        string memory name,
        string memory experience
    ) {
        Credential memory credential = credentials[credentialHash];
        exists = credential.issuer != address(0);

        if (exists) {
            revoked = credential.revoked;
            expired = block.timestamp > credential.expiryDate;
            issuer = credential.issuer;
            holder = credential.holder;
            issuedAt = credential.issuedAt;
            expiryDate = credential.expiryDate;
            name = credential.name;
            experience = credential.experience;
        }
    }

    function getHolderCredentials(address holder) public view returns (bytes32[] memory) {
        return holderCredentials[holder];
    }

    function getIssuerCredentials(address issuer) public view returns (bytes32[] memory) {
        return issuerCredentials[issuer];
    }

    function registerDocument(
        bytes32 documentHash,
        uint256 validFrom,
        uint256 validTo,
        string calldata organizationName
    ) external {
        require(documentHash != bytes32(0), "Invalid document hash");
        require(validTo > validFrom, "Invalid duration");
        require(!registeredDocuments[documentHash], "Document already registered");
        registeredDocuments[documentHash] = true;
        emit DocumentRegistered(msg.sender, documentHash, validFrom, validTo, organizationName);
    }

    function isDocumentRegistered(bytes32 documentHash) external view returns (bool) {
        return registeredDocuments[documentHash];
    }
}
