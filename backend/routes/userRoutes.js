import express from "express";
import User from "../models/User.js";
import OrgApprovalRequest from "../models/OrgApprovalRequest.js";
import { ethers } from "ethers";

const router = express.Router();

// Helper function to verify wallet signature
const verifyWalletSignature = (message, signature, expectedAddress) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, role, username, password, walletAddress, signature, organizationName, website, description } = req.body;
  try {
    // Check if username already exists
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: "Username already exists" });

    // Check if wallet is already registered
    if (walletAddress) {
      const walletUser = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (walletUser) {
        return res.status(400).json({
          message: "This wallet is already registered with another account"
        });
      }

      // ✅ VERIFY SIGNATURE - Wallet ownership verification
      if (!signature) {
        return res.status(400).json({
          message: "Wallet signature is required to verify ownership. Please sign the message with your wallet."
        });
      }

      const message = `Sign this message to verify wallet ownership for ${username} on DHRUVA`;
      const isValidSignature = verifyWalletSignature(message, signature, walletAddress);

      if (!isValidSignature) {
        return res.status(403).json({
          message: "Invalid signature. Wallet ownership could not be verified. Please ensure you're signing with the correct wallet."
        });
      }
    }

    // Create user
    user = new User({
      name,
      email,
      role,
      username,
      password,
      walletAddress: walletAddress ? walletAddress.toLowerCase() : null,
      organizationName: role === "org" ? organizationName : undefined,
      website: role === "org" ? website : undefined,
      description: role === "org" ? description : undefined,
    });
    await user.save();

    // If role is org, create approval request (only if wallet address exists)
    if (role === "org" && user.walletAddress) {
      // Check if there's already a pending request for this organization
      const existingRequest = await OrgApprovalRequest.findOne({
        organizationId: user._id,
        status: "pending"
      });

      // Only create if no pending request exists
      if (!existingRequest) {
        const approvalRequest = new OrgApprovalRequest({
          organizationId: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          organizationName: organizationName || "Unnamed Organization",
          website,
          description,
        });
        await approvalRequest.save();
      }
    }

    res.status(201).json({ user, token: "dummy-jwt-token" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login with Username/Password + Wallet Verification
router.post("/login", async (req, res) => {
  const { username, password, walletAddress, signature } = req.body;
  try {
    const user = await User.findOne({ username });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Verify password
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Verify wallet address matches (if wallet was registered)
    if (user.walletAddress && walletAddress) {
      const normalizedWallet = walletAddress.toLowerCase();
      if (user.walletAddress !== normalizedWallet) {
        return res.status(403).json({
          message: "Wallet address does not match. Please connect with the wallet you registered with.",
          registeredWallet: user.walletAddress
        });
      }

      // ✅ VERIFY SIGNATURE - Wallet ownership verification
      if (!signature) {
        return res.status(400).json({
          message: "Wallet signature is required to verify ownership. Please sign the message with your wallet."
        });
      }

      const message = `Sign this message to verify wallet ownership for ${username} on DHRUVA`;
      const isValidSignature = verifyWalletSignature(message, signature, walletAddress);

      if (!isValidSignature) {
        return res.status(403).json({
          message: "Invalid signature. Wallet ownership could not be verified. Please ensure you're signing with the correct wallet."
        });
      }
    } else if (user.walletAddress && !walletAddress) {
      return res.status(403).json({
        message: "Please connect your registered MetaMask wallet to login"
      });
    } else if (!user.walletAddress && walletAddress) {
      // First time connecting wallet - link it to the account
      // ✅ VERIFY SIGNATURE FIRST
      if (!signature) {
        return res.status(400).json({
          message: "Wallet signature is required to verify ownership. Please sign the message with your wallet."
        });
      }

      const message = `Sign this message to link wallet to ${username} on DHRUVA`;
      const isValidSignature = verifyWalletSignature(message, signature, walletAddress);

      if (!isValidSignature) {
        return res.status(403).json({
          message: "Invalid signature. Wallet ownership could not be verified. Please ensure you're signing with the correct wallet."
        });
      }

      user.walletAddress = walletAddress.toLowerCase();
      await user.save();

      // If user is an org and not approved, create approval request
      if (user.role === "org" && !user.isApproved) {
        const existingRequest = await OrgApprovalRequest.findOne({
          organizationId: user._id,
          status: "pending"
        });

        if (!existingRequest) {
          const approvalRequest = new OrgApprovalRequest({
            organizationId: user._id,
            walletAddress: user.walletAddress,
            username: user.username,
            organizationName: user.organizationName || "Unnamed Organization",
            website: user.website,
            description: user.description,
          });
          await approvalRequest.save();
        }
      }
    }

    res.json({ user, token: "dummy-jwt-token" }); // In real app, sign JWT
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Link Wallet to User
router.post("/link-wallet", async (req, res) => {
  const { userId, walletAddress, signature } = req.body;

  if (!signature) {
    return res.status(400).json({
      message: "Wallet signature is required to verify ownership. Please sign the message with your wallet."
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if wallet is already linked to another account
    const existingUser = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({
        message: "This wallet is already linked to another account"
      });
    }

    // ✅ VERIFY SIGNATURE
    const message = `Sign this message to link wallet to ${user.username} on DHRUVA`;
    const isValidSignature = verifyWalletSignature(message, signature, walletAddress);

    if (!isValidSignature) {
      return res.status(403).json({
        message: "Invalid signature. Wallet ownership could not be verified. Please ensure you're signing with the correct wallet."
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { walletAddress: walletAddress.toLowerCase() },
      { new: true }
    );

    // If user is org and not approved, create approval request
    if (updatedUser.role === "org" && !updatedUser.isApproved && updatedUser.walletAddress) {
      const existingRequest = await OrgApprovalRequest.findOne({
        organizationId: updatedUser._id,
        status: "pending"
      });

      if (!existingRequest) {
        const approvalRequest = new OrgApprovalRequest({
          organizationId: updatedUser._id,
          walletAddress: updatedUser.walletAddress,
          username: updatedUser.username,
          organizationName: updatedUser.organizationName || "Unnamed Organization",
          website: updatedUser.website,
          description: updatedUser.description,
        });
        await approvalRequest.save();
      }
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Unlink Wallet from User (also handles blockchain revocation info)
router.post("/unlink-wallet", async (req, res) => {
  const { userId, walletAddress } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.walletAddress || user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({
        message: "Wallet address does not match user's linked wallet"
      });
    }

    // Store old wallet for blockchain revocation info
    const oldWalletAddress = user.walletAddress;

    // Remove wallet from backend
    user.walletAddress = null;
    await user.save();

    // Return info about blockchain revocation if needed
    res.json({
      message: "Wallet unlinked successfully",
      oldWalletAddress,
      requiresBlockchainRevocation: user.role === "org" && user.isApproved,
      note: "If this organization was authorized on blockchain, please revoke authorization manually using the Authorization page or contact the contract owner."
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get or Create User/Org by Wallet Address (Legacy/Direct Wallet Auth)
router.post("/auth", async (req, res) => {
  const { walletAddress, role } = req.body;

  try {
    const normalizedAddress = walletAddress.toLowerCase();
    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      // First time login - create new user with the specified role
      user = new User({
        walletAddress: normalizedAddress,
        username: normalizedAddress, // Use wallet address as username for wallet-only auth
        password: "wallet-auth", // Dummy password for wallet-only auth
        role,
      });
      await user.save();
      return res.status(201).json({
        user,
        message: "Account created successfully"
      });
    } else {
      // User already exists - verify role matches
      if (user.role !== role) {
        return res.status(403).json({
          message: `This wallet is already registered as a ${user.role}. Please use the correct role to login.`,
          existingRole: user.role,
          requestedRole: role
        });
      }
      // Role matches - allow login
      return res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update Profile
router.put("/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  const updates = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      updates,
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Profile
router.get("/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Profile by Username
router.get("/profile/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Forgot Password - Reset password for a user
router.post("/forgot-password", async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Validate inputs
    if (!username || !newPassword) {
      return res.status(400).json({ message: "Username and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password reset successful",
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
