# Bidirectional Communication System - Implementation Guide

## Overview
This implementation adds a complete bidirectional communication system that allows:
1. **Users** to upload documents and send them to organizations for approval
2. **Organizations** to review, approve, or reject document approval requests
3. **Automatic credential issuance** when an organization approves a document

## Changes Made

### 1. Backend Changes

#### New Model: ApprovalRequest.js
- Location: `backend/models/ApprovalRequest.js`
- Tracks approval requests from users to organizations
- Fields: requester, organization, documentHash, status (pending/approved/rejected), etc.

#### New Routes: approvalRoutes.js
- Location: `backend/routes/approvalRoutes.js`
- POST `/api/approval-requests` - Create new approval request
- GET `/api/approval-requests/organization/:address` - Get requests for an organization
- GET `/api/approval-requests/requester/:address` - Get requests by a user
- PATCH `/api/approval-requests/:id` - Approve/reject a request
- DELETE `/api/approval-requests/:id` - Cancel a pending request

#### Updated: Credential.js
- Added verification fields: `verified`, `verifiedBy`, `verifiedAt`
- Tracks which credentials have been verified by organizations

#### Updated: server.js
- Added approval routes to the server

### 2. Smart Contract Changes

#### Updated: DIDRegistry.sol
- Added `ApprovalRequest` struct
- Added mappings for approval requests
- Added events: `ApprovalRequestSubmitted`, `ApprovalRequestProcessed`
- New functions:
  - `submitApprovalRequest()` - User submits document for approval
  - `processApprovalRequest()` - Organization approves/rejects
  - `getUserRequests()` - Get all requests by a user
  - `getOrganizationRequests()` - Get all requests to an organization

### 3. Frontend Changes

#### New Page: UserRequestApproval.tsx
- Location: `frontend/src/pages/user/UserRequestApproval.tsx`
- Allows users to upload documents and send to organizations for approval
- Users enter organization wallet address and document details

#### New Page: OrgApproval.tsx
- Location: `frontend/src/pages/org/OrgApproval.tsx`
- Organizations can:
  - View all approval requests (pending/approved/rejected)
  - Approve requests (automatically issues credential)
  - Reject requests with a reason
  - View document files

#### Updated: backend.ts
- Added API functions for approval requests

#### Updated: contractService.ts
- Added functions: `submitApprovalRequest`, `processApprovalRequest`, `getUserRequests`, `getOrganizationRequests`, `getApprovalRequest`
- Updated DEFAULT_ABI with new contract functions

#### Updated: Web3Context.tsx
- Added `submitApprovalRequest` and `processApprovalRequest` to context

#### Updated: App.tsx
- Added route `/dashboard/request-approval` for users
- Added route `/org/approvals` for organizations

#### Updated: DashboardLayout.tsx
- Added "Request Approval" navigation item for users
- Added "Approval Requests" navigation item for organizations

## How It Works

### User Flow
1. User navigates to "Request Approval" page
2. User uploads a document (PDF, JPG, PNG)
3. User enters:
   - Organization wallet address
   - Document name and type
   - Description
   - Expiry date
4. User submits the request
5. Document is hashed and submitted to blockchain
6. Approval request is saved to backend with file

### Organization Flow
1. Organization navigates to "Approval Requests" page
2. Organization sees all pending requests
3. For each request, organization can:
   - View the document file
   - Click "Review Request"
   - Add a response message
   - Click "Approve & Issue Credential" OR "Reject"

### Approval Process
When an organization approves:
1. A new credential is issued on the blockchain
2. The credential is marked as "verified"
3. The credential is saved to the backend
4. The approval request status is updated to "approved"
5. The user receives the verified credential in their vault

## Deployment Steps

### 1. Backend Deployment
```bash
cd backend
npm install
npm run dev
```

### 2. Smart Contract Deployment
You need to **redeploy** the updated smart contract:
```bash
# Compile the contract
forge build

# Deploy to your network (e.g., Sepolia)
forge script script/Deploy.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast

# Update .env files with new contract address
```

### 3. Update Frontend Configuration
Update `frontend/.env`:
```
VITE_CONTRACT_ADDRESS=<NEW_CONTRACT_ADDRESS>
VITE_BACKEND_URL=http://localhost:5000
```

### 4. Frontend Deployment
```bash
cd frontend
npm install
npm run dev
```

## Testing the Feature

### As a User:
1. Login as a user
2. Go to "Request Approval"
3. Upload a test document
4. Enter an organization's wallet address (you'll need to know one)
5. Submit the request

### As an Organization:
1. Login as an organization
2. Go to "Approval Requests"
3. You should see the pending request
4. Click "Review Request"
5. Approve or reject it

### Verification:
- If approved, check the user's "Vault" - the credential should appear
- The credential will be marked as verified
- Check the blockchain for the credential issuance event

## Important Notes

1. **Contract Redeployment Required**: The smart contract has new functions, so you must redeploy it
2. **Authorization**: Organizations must be authorized issuers to approve requests
3. **File Storage**: Files are stored in `backend/uploads/` directory
4. **Request Hash**: The system uses documentHash as the identifier for blockchain storage

## API Endpoints

### Create Approval Request
```
POST /api/approval-requests
Content-Type: multipart/form-data

Body:
- requester: user wallet address
- organization: org wallet address
- documentHash: keccak256 hash
- documentName: string
- documentType: string (optional)
- description: string (optional)
- expiryDate: timestamp
- file: uploaded file
```

### Get Organization Requests
```
GET /api/approval-requests/organization/:address?status=pending
```

### Approve/Reject Request
```
PATCH /api/approval-requests/:id
Content-Type: application/json

Body:
{
  "status": "approved" | "rejected",
  "responseMessage": "Optional message",
  "issuedCredentialHash": "credential hash if approved"
}
```

## Troubleshooting

1. **"Wallet not connected"**: Ensure MetaMask is connected
2. **"Only authorized issuers"**: Organization must be authorized first (use Issuer Auth page)
3. **"Request already exists"**: User has already submitted this document to this org
4. **Contract errors**: Make sure you deployed the updated contract and updated the address

## Future Enhancements
- Email notifications when requests are approved/rejected
- Bulk approval for organizations
- Request comments/chat
- Document versioning
- Approval workflows with multiple approvers
