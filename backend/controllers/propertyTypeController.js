import { prisma } from "../lib/prisma.js";

// @desc    Create a new property type
// @route   POST /api/property-types
export const createPropertyType = async (req, res) => {
  console.log("📥 CREATE PROPERTY TYPE REQUEST:", { body: req.body, headers: req.headers['content-type'] });
  const { name } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: "Property type name is required." });
  }

  try {
    const propertyType = await prisma.propertyType.create({
      data: { name },
    });
    res.status(201).json({ message: "Property type created successfully", propertyType });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Property type name already exists" });
    }
    res.status(500).json({ message: "Error creating property type", error: error.message });
  }
};

// @desc    Get all property types
// @route   GET /api/property-types
export const getPropertyTypes = async (req, res) => {
  try {
    const propertyTypes = await prisma.propertyType.findMany({
      include: {
        _count: { select: { properties: true } },
      },
    });
    res.status(200).json(propertyTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching property types", error: error.message });
  }
};

// @desc    Get property type by ID
// @route   GET /api/property-types/:id
export const getPropertyTypeById = async (req, res) => {
  const { id } = req.params;
  try {
    const propertyType = await prisma.propertyType.findUnique({
      where: { id: parseInt(id) },
      include: { properties: true },
    });

    if (!propertyType) {
      return res.status(404).json({ message: "Property type not found" });
    }

    res.status(200).json(propertyType);
  } catch (error) {
    res.status(500).json({ message: "Error fetching property type", error: error.message });
  }
};

// @desc    Update a property type
// @route   PATCH /api/property-types/:id
export const updatePropertyType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};

  try {
    const updatedPropertyType = await prisma.propertyType.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.status(200).json({ message: "Property type updated successfully", propertyType: updatedPropertyType });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Property type not found" });
    }
    res.status(500).json({ message: "Error updating property type", error: error.message });
  }
};

// @desc    Delete a property type
// @route   DELETE /api/property-types/:id
export const deletePropertyType = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.propertyType.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Property type deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Property type not found" });
    }
    res.status(500).json({ message: "Error deleting property type", error: error.message });
  }
};
