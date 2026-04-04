import { prisma } from "../lib/prisma.js";

// @desc    Create a new property
// @route   POST /api/properties
export const createProperty = async (req, res) => {
  console.log("📥 CREATE PROPERTY REQUEST:", { body: req.body, headers: req.headers['content-type'] });
  const { 
    title, description, location, price, listingType, 
    ownerId, propertyTypeId, images: bodyImages, features 
  } = req.body || {};

  // Combine images from body (URLs) and files (uploads)
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => `/uploads/${file.filename}`);
  } else if (bodyImages) {
    images = Array.isArray(bodyImages) ? bodyImages : [bodyImages];
  }

  if (!title || !location || !price || !listingType || !ownerId || !propertyTypeId) {
    return res.status(400).json({ message: "Missing required fields (title, location, price, listingType, ownerId, propertyTypeId)." });
  }

  try {
    const property = await prisma.property.create({
      data: {
        title,
        description,
        location,
        price: parseFloat(price),
        listingType,
        ownerId: parseInt(ownerId),
        propertyTypeId: parseInt(propertyTypeId),
        // Create nested images if provided (array of strings)
        images: images && Array.isArray(images) ? {
          create: images.map(url => ({ url }))
        } : undefined,
        // Create nested features if provided (array of strings)
        features: features && Array.isArray(features) ? {
          create: features.map(name => ({ name }))
        } : undefined
      },
      include: { 
        images: { orderBy: { id: 'desc' } }, 
        features: true 
      }
    });

    res.status(201).json({ message: "Property created successfully", property });
  } catch (error) {
    res.status(500).json({ message: "Error creating property", error: error.message });
  }
};

// @desc    Get all properties
// @route   GET /api/properties
export const getProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        images: { orderBy: { id: 'desc' } },
        propertyType: { select: { name: true } },
        owner: { select: { name: true, phone: true } }
      }
    });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching properties", error: error.message });
  }
};

// @desc    Get property by ID
// @route   GET /api/properties/:id
export const getPropertyById = async (req, res) => {
  const { id } = req.params;
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: { orderBy: { id: 'desc' } },
        features: true,
        propertyType: true,
        owner: { select: { name: true, email: true, phone: true, photo: true } }
      }
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: "Error fetching property", error: error.message });
  }
};

// @desc    Update a property
// @route   PATCH /api/properties/:id
export const updateProperty = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body || {};

  try {
    // Process numeric fields
    const updateData = {};
    if (updateFields.title) updateData.title = updateFields.title;
    if (updateFields.description) updateData.description = updateFields.description;
    if (updateFields.location) updateData.location = updateFields.location;
    if (updateFields.price) updateData.price = parseFloat(updateFields.price);
    if (updateFields.listingType) updateData.listingType = updateFields.listingType;
    if (updateFields.status) updateData.status = updateFields.status;
    if (updateFields.ownerId) updateData.ownerId = parseInt(updateFields.ownerId);
    if (updateFields.propertyTypeId) updateData.propertyTypeId = parseInt(updateFields.propertyTypeId);

    // Handle IMAGE REPLACEMENT if new ones are uploaded during patch
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({ url: `/uploads/${file.filename}` }));
      updateData.images = {
        // This will DELETE all existing images for this property and CREATE the new ones
        deleteMany: {}, 
        create: newImages
      };
    }

    const updatedProperty = await prisma.property.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { 
        images: { orderBy: { id: 'desc' } } 
      }
    });

    res.status(200).json({ message: "Property updated successfully", property: updatedProperty });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(500).json({ message: "Error updating property", error: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
export const deleteProperty = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.property.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(500).json({ message: "Error deleting property", error: error.message });
  }
};
