import apiClient from './client';

export const backend = {
  // User/Org Auth & Profile
  loginOrRegister: async (walletAddress: string, role: 'user' | 'org') => {
    const response = await apiClient.post('/users/auth', { walletAddress, role });
    return response.data;
  },
  getUserProfile: async (walletAddress: string) => {
    const response = await apiClient.get(`/users/${walletAddress}`);
    return response.data;
  },
  updateUserProfile: async (walletAddress: string, data: any) => {
    const response = await apiClient.put(`/users/${walletAddress}`, data);
    return response.data;
  },

  // Credentials
  saveCredential: async (data: any) => {
    const response = await apiClient.post('/credentials', data);
    return response.data;
  },
  getCredentialsByHolder: async (holderAddress: string) => {
    const response = await apiClient.get(`/credentials/holder/${holderAddress}`);
    return response.data;
  },
  getCredentialsByIssuer: async (issuerAddress: string) => {
    const response = await apiClient.get(`/credentials/issuer/${issuerAddress}`);
    return response.data;
  },
  getCredentialByHash: async (hash: string) => {
    const response = await apiClient.get(`/credentials/hash/${encodeURIComponent(hash)}`);
    return response.data;
  },
  verifyCredential: async (hash: string) => {
    const response = await apiClient.get(`/credentials/verify/${encodeURIComponent(hash)}`);
    return response.data;
  },
  batchVerify: async (hashes: string[]) => {
    const response = await apiClient.post("/credentials/batch-verify", { hashes });
    return response.data;
  },

  // Approval Requests
  createApprovalRequest: async (data: any) => {
    const response = await apiClient.post('/approval-requests', data);
    return response.data;
  },
  getApprovalRequestsByOrganization: async (orgAddress: string, status?: string) => {
    const url = status 
      ? `/approval-requests/organization/${orgAddress}?status=${status}`
      : `/approval-requests/organization/${orgAddress}`;
    const response = await apiClient.get(url);
    return response.data;
  },
  getApprovalRequestsByRequester: async (requesterAddress: string) => {
    const response = await apiClient.get(`/approval-requests/requester/${requesterAddress}`);
    return response.data;
  },
  updateApprovalRequest: async (id: string, data: any) => {
    const response = await apiClient.patch(`/approval-requests/${id}`, data);
    return response.data;
  },
  deleteApprovalRequest: async (id: string, requester: string) => {
    const response = await apiClient.delete(`/approval-requests/${id}?requester=${requester}`);
    return response.data;
  },

  // Wallet Management
  unlinkWallet: async (userId: string, walletAddress: string) => {
    const response = await apiClient.post('/users/unlink-wallet', { userId, walletAddress });
    return response.data;
  },
};
