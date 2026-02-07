import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { UserDashboard } from './pages/user/UserDashboard';
import { UserCredentials } from './pages/user/UserCredentials';
import { UserUpload } from './pages/user/UserUpload';
import { UserShare } from './pages/user/UserShare';
import { UserProfile } from './pages/user/UserProfile';
import { UserDID } from './pages/user/UserDID';
import { UserRequestApproval } from './pages/user/UserRequestApproval';
import { UserApprovalStatus } from './pages/user/UserApprovalStatus';
import { OrgDashboard } from './pages/org/OrgDashboard';
import { OrgIssue } from './pages/org/OrgIssue';
import { OrgIssued } from './pages/org/OrgIssued';
import { OrgVerify } from './pages/org/OrgVerify';
import { OrgProfile } from './pages/org/OrgProfile';
import { OrgIssuerAuth } from './pages/org/OrgIssuerAuth';
import { OrgApproval } from './pages/org/OrgApproval';
import { VerifierDashboard } from './pages/verifier/VerifierDashboard';
import { VerifyPublic } from './pages/VerifyPublic';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: ('user' | 'org' | 'verifier' | 'admin')[] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* User Routes */}
          <Route path="/verify" element={<VerifyPublic />} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["user"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="credentials" element={<UserCredentials />} />
            <Route path="upload" element={<UserUpload />} />
            <Route path="request-approval" element={<UserRequestApproval />} />
            <Route path="approval-status" element={<UserApprovalStatus />} />
            <Route path="share" element={<UserShare />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="did" element={<UserDID />} />
          </Route>

          {/* Organization Routes */}
          <Route path="/org" element={
            <ProtectedRoute allowedRoles={["org"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<OrgDashboard />} />
            <Route path="issue" element={<OrgIssue />} />
            <Route path="issued" element={<OrgIssued />} />
            <Route path="verify" element={<OrgVerify />} />
            <Route path="approval" element={<OrgApproval />} />
            <Route path="profile" element={<OrgProfile />} />
            <Route path="issuer-auth" element={<OrgIssuerAuth />} />
          </Route>

          <Route path="/verifier" element={
            <ProtectedRoute allowedRoles={["verifier"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/verifier/dashboard" replace />} />
            <Route path="dashboard" element={<VerifierDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
