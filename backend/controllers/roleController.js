import { prisma } from "../lib/prisma.js";

// @desc    Create a new role
// @route   POST /api/roles
// @access  Public (or semi-admin)
export const createRole = async (req, res) => {
  console.log("📥 CREATE ROLE REQUEST:", { body: req.body, headers: req.headers['content-type'] });
  const { name, description } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: "Role name is required. Ensure you are sending JSON with 'Content-Type: application/json' header." });
  }

  try {
    const role = await prisma.role.create({
      data: {
        name,
        description,
      },
    });
    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Role name already exists" });
    }
    res.status(500).json({ message: "Error creating role", error: error.message });
  }
};

// @desc    Get all roles
// @route   GET /api/roles
// @access  Public
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles", error: error.message });
  }
};

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Public
export const getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: true,
      },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: "Error fetching role", error: error.message });
  }
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Public
export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body || {};

  try {
    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
    });
    res.status(200).json({ message: "Role updated successfully", role: updatedRole });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(500).json({ message: "Error updating role", error: error.message });
  }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Public
export const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.role.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(500).json({ message: "Error deleting role", error: error.message });
  }
};
