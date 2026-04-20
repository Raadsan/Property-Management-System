import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// @desc    Create a new user
// @route   POST /api/users
export const createUser = async (req, res) => {
  console.log("📥 CREATE USER REQUEST:", { body: req.body, headers: req.headers['content-type'] });
  const { name, email, phone, roleId, password, photo, status } = req.body || {};

  if (!name || !phone || !roleId || !password) {
    return res.status(400).json({ message: "Missing required fields (name, phone, roleId, password)" });
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let photoPath = photo;
    if (req.file) {
      photoPath = req.file.path;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        roleId: parseInt(roleId),
        password: hashedPassword,
        photo: photoPath,
        status: status || "ACTIVE",
      },
    });

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: {
          select: { name: true }
        }
      },
    });

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...u } = user;
      return u;
    });

    res.status(200).json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        role: {
          select: { name: true }
        },
        propertiesOwned: true
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// @desc    Update a user
// @route   PATCH /api/users/:id
export const updateUser = async (req, res) => {
  const { id } = req.params;
  console.log("📥 UPDATE USER REQUEST:", { id, body: req.body, file: req.file });
  const { name, email, phone, roleId, password, photo, status } = req.body || {};

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (status) updateData.status = status;
    if (roleId) updateData.roleId = parseInt(roleId);

    // Handle photo upload
    if (req.file) {
      updateData.photo = req.file.path;
    } else if (photo) {
      updateData.photo = photo;
    }

    // If updating password, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json({ message: "User updated successfully", user: userWithoutPassword });
  } catch (error) {
    console.error("❌ UPDATE USER ERROR:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// @desc    Login a user
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Please provide email/phone and password" });
  }

  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: identifier
      },
      include: {
        role: {
          select: { name: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Check if user is active
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Your account is currently disabled. Contact administrator." });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Return success (and user data without password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword
    });

  } catch (error) {
    res.status(500).json({ message: "Error during login process", error: error.message });
  }
};

// --- FORGOT PASSWORD LOGIC ---

// Helper to generate 6-digit code
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Forgot Password - Send Code
// @route   POST /api/users/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = generateResetCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: { resetCode: code, resetCodeExpires: expires }
    });

    // Configure transporter (use same env vars as ContactController)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Property Management'}" <${process.env.SMTP_EMAIL || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fdfdfd;">
          <h2 style="color: #214347; text-align: center; border-bottom: 2px solid #214347; padding-bottom: 10px;">Password Reset</h2>
          <p style="text-align: center; color: #555; font-size: 15px;">You requested a password reset. Use the code below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #214347; background: #e6f2f3; padding: 15px 30px; border-radius: 12px; display: inline-block;">${code}</span>
          </div>
          <p style="text-align: center; color: #888; font-size: 13px;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="text-align: center; color: #888; font-size: 13px;">If you did not request this, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
            Sent from Damal Property Management System.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Reset code sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending reset code", error: error.message });
  }
};

// @desc    Verify Code
// @route   POST /api/users/verify-code
export const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: "Email and code are required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetCode !== code || (user.resetCodeExpires && user.resetCodeExpires < new Date())) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    res.status(200).json({ message: "Code verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying code", error: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/users/reset-password
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ message: "Missing required fields" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetCode !== code || (user.resetCodeExpires && user.resetCodeExpires < new Date())) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null
      }
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};
