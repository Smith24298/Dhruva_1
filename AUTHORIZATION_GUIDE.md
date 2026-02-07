# Organization Authorization Process

## How It Works

When a new organization signs up, they go through a two-stage approval process:

### Stage 1: Admin Approval (Database)
1. Organization signs up with role "org"
2. An approval request is automatically created in MongoDB
3. Organization cannot issue credentials until approved
4. Admin logs in and views pending requests in Admin Dashboard
5. Admin approves or rejects the organization

### Stage 2: Blockchain Authorization (Smart Contract)
After admin approval, the organization's wallet must be authorized in the smart contract:

- **Automatic**: When admin approves (if admin wallet is connected and admin is contract owner)
- **Manual**: Organization can self-authorize via "Authorization" page in their dashboard

## For Admins

**Requirements:**
- Be logged in as admin role
- Have MetaMask wallet connected
- Ideally be the contract owner (wallet that deployed the contract)

**Steps to Approve Organization:**
1. Go to Admin Dashboard
2. Connect your MetaMask wallet (required for blockchain authorization)
3. Review pending organization requests
4. Click "Approve" on an organization
5. System will:
   - ✅ Mark org as approved in database
   - ✅ Authorize org's wallet in smart contract (if you're contract owner)
   - ⚠️ Show warning if blockchain authorization fails

**If You're Not the Contract Owner:**
- Database approval will succeed
- Blockchain authorization will fail with "Only owner" error
- Organization will need to authorize themselves or contact contract owner

## For Organizations

**After Admin Approval:**
If blockchain authorization didn't happen automatically:

1. Go to your dashboard
2. Navigate to "Authorization" page
3. Follow instructions to authorize your wallet
4. Once authorized, you can issue credentials

## Troubleshooting

**Error: "Only authorized issuers can call this function"**
- Your organization is approved in database but NOT authorized on blockchain
- Solution: Use the "Authorization" page in org dashboard
- OR: Ask admin (who is contract owner) toapprove you again with wallet connected

**Error: "Pending admin approval"**
- Your organization request hasn't been approved yet
- Solution: Wait for admin to approve your registration

**Error: "Only owner can call this function"**
- The admin approving you is not the contract owner
- Solution: Org must self-authorize via "Authorization" page
