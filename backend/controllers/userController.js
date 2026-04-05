import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

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

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        roleId: parseInt(roleId),
        password: hashedPassword,
        photo,
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
  const { name, email, phone, roleId, password, photo, status } = req.body || {};

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (photo) updateData.photo = photo;
    if (status) updateData.status = status;
    if (roleId) updateData.roleId = parseInt(roleId);
    
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
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
      return res.status(401).json({ message: "Invalid email or password" });
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
