export type Role = 'user' | 'org' | 'verifier' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  did?: string;
  walletAddress?: string;
  username?: string;
  isApproved?: boolean;
  organizationName?: string;
}

export interface Credential {
  id: string;
  name: string;
  description: string;
  issuerName: string;
  issuerId: string;
  holderName: string;
  holderId: string;
  issueDate: string;
  status: 'valid' | 'revoked' | 'expired';
  verified: boolean;
  credentialHash?: string;
  expiryDate?: string;
}

export interface BlockchainCredential {
  exists: boolean;
  revoked: boolean;
  expired: boolean;
  issuer: string;
  holder: string;
  issuedAt: bigint;
  expiryDate: bigint;
  name?: string;
  experience?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface DIDRegistration {
  walletAddress: string;
  did: string;
  registeredAt: Date;
}
