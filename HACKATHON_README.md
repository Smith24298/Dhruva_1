# DHURVA — Verifiable Credentials Platform

> Blockchain-anchored, privacy-preserving credential system. Hackathon-ready.

## System Overview

| Role | Description | Access |
|------|-------------|--------|
| **Issuer** | University, employer, government. Issues credentials, anchors hash on blockchain. | `/org/*` |
| **Holder** | Student, professional. Owns credentials in wallet. Generates QR for sharing. | `/dashboard/*` |
| **Verifier** | Employer, bank. Scans QR or pastes hash. Instant on-chain verification. | `/verifier/*`, `/verify` (public) |

### Architecture

- **Blockchain**: Stores credential hash, issuer, holder, revocation status. No personal data on-chain.
- **Off-chain**: Backend stores full credential JSON (metadata, file reference).
- **QR**: Holder generates QR with proof. Verifier scans → fetches credential → checks blockchain.

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Holder | tirth1356 | 123 |
| Issuer (Org) | tirth | 12 |
| Verifier | verifier | verify |

## Quick Start

### 1. Backend

```bash
cd backend
npm install
# Create .env with MONGODB_URI=mongodb://localhost:27017/dhruva
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
# Create .env with VITE_CONTRACT_ADDRESS=<deployed>, VITE_API_URL=http://localhost:5000/api
npm run dev
```

### 3. Contract

Deploy via Remix or Foundry. See `REMIX_AND_ENV_SETUP.md` and `DEPLOYMENT_GUIDE.md`.

## Flow

1. **Issuer** logs in → connects wallet → Issue Asset → destination address, type, file, expiry.
2. **Holder** connects wallet → sees credentials → selects → Create QR → shares.
3. **Verifier** opens `/verify` → pastes hash or scans QR → instant result (Verified/Revoked/Expired).

## Endpoints

- `POST /api/credentials` — Save credential (after on-chain issue)
- `GET /api/credentials/holder/:address` — Holder credentials
- `GET /api/credentials/verify/:hash` — Verification metadata
- `POST /api/credentials/batch-verify` — Batch verification (CSV)

## Compliance

- No personal data on blockchain
- User consent before sharing
- DPDP-aligned design
