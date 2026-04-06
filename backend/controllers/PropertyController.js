import { prisma } from "../lib/prisma.js";
import axios from "axios";

// @desc    Create a new property
// @route   POST /api/properties
export const createProperty = async (req, res) => {
  console.log("📥 CREATE PROPERTY REQUEST:", { body: req.body, headers: req.headers['content-type'] });
  const {
    title, description, location, price,
    ownerId, propertyTypeId, images: bodyImages, features: bodyFeatures
  } = req.body || {};
  const listingType = "BOOKING"; // Force all new properties to be BOOKING type

  // Combine images from body (URLs) and files (uploads)
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => `/uploads/${file.filename}`);
  } else if (bodyImages) {
    images = Array.isArray(bodyImages) ? bodyImages : [bodyImages];
  }

  // Parse features if they come as a JSON string (common in form-data)
  let features = [];
  if (bodyFeatures) {
    if (Array.isArray(bodyFeatures)) {
      features = bodyFeatures;
    } else {
      try {
        const parsed = JSON.parse(bodyFeatures);
        features = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        features = [bodyFeatures];
      }
    }
  }

  if (!title || !location || !price || !ownerId || !propertyTypeId) {
    return res.status(400).json({ message: "Missing required fields (title, location, price, ownerId, propertyTypeId)." });
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
        images: images && images.length > 0 ? {
          create: images.map(url => ({ url }))
        } : undefined,
        // Create nested features if provided (array of strings)
        features: features && features.length > 0 ? {
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
        features: true,
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

    // Handle FEATURE REPLACEMENT if provided during patch (array of strings)
    if (updateFields.features) {
      let finalFeatures = [];
      if (Array.isArray(updateFields.features)) {
        finalFeatures = updateFields.features;
      } else {
        try {
          const parsed = JSON.parse(updateFields.features);
          finalFeatures = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          finalFeatures = [updateFields.features];
        }
      }

      updateData.features = {
        deleteMany: {},
        create: finalFeatures.map(name => ({ name }))
      };
    }

    const updatedProperty = await prisma.property.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        images: { orderBy: { id: 'desc' } },
        features: true
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
  const propertyId = parseInt(id);
  try {
    // Prevent foreign key constraint errors by gracefully deleting related records first
    await prisma.propertyImage.deleteMany({ where: { propertyId } });
    await prisma.feature.deleteMany({ where: { propertyId } });
    await prisma.favorite.deleteMany({ where: { propertyId } });

    await prisma.property.delete({ where: { id: propertyId } });
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(500).json({ message: "Error deleting property", error: error.message });
  }
};

// @desc    Book a property with Wafi payment
// @route   POST /api/properties/:id/book
export const bookNow = async (req, res) => {
  const { id } = req.params;
  const { userId, phone } = req.body;

  if (!userId || !phone) {
    return res.status(400).json({ message: "Missing required fields: userId, phone" });
  }

  try {
    const propertyId = parseInt(id);
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.status !== "AVAILABLE") {
      return res.status(400).json({ message: "Property is no longer available" });
    }

    // Process $100 Payment with Wafi API
    const waafiEndpoint = 'https://api.waafipay.net/asm';
    const payload = {
      schemaVersion: "1.0",
      requestId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: process.env.WAAFI_MERCHANT_UID,
        apiUserId: process.env.WAAFI_API_USER_ID,
        apiKey: process.env.WAAFI_API_KEY,
        paymentMethod: "mwallet_account",
        payerInfo: { accountNo: phone },
        transactionInfo: {
          referenceId: "BOOK-" + Date.now(),
          invoiceId: "INV-" + Date.now(),
          amount: "100", // Fixed $100
          currency: "USD",
          description: `Booking Fee for Property ${property.title}`
        }
      }
    };

    const wafiResponse = await axios.post(waafiEndpoint, payload);
    const wafiResult = wafiResponse.data;

    // Waafi usually replies with responseCode "2001" on success
    if (wafiResult.responseCode !== "2001" && wafiResult.responseMsg !== "RCS_SUCCESS") {
       throw new Error(`Wafi Payment Failed: ${wafiResult.responseMsg}`);
    }

    // Create booking and update property in DB if Wafi payment succeeds
    const booking = await prisma.$transaction(async (tx) => {
      // Set the start and end dates programmatically so Prisma schema is happy
      const now = new Date();
      // Assume "Booking" holds the property for 30 days as a standard placeholder duration since front-end input was removed.
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 30);

      const newBooking = await tx.booking.create({
        data: {
          propertyId,
          userId: parseInt(userId),
          startDate: now,
          endDate: futureDate,
          price: 100
        }
      });

      // Update property to BOOKED
      await tx.property.update({
        where: { id: propertyId },
        data: { status: 'BOOKED' }
      });

      return newBooking;
    });

    res.status(200).json({ message: "Booking and payment successful via Wafi", booking, paymentResult: wafiResult });
  } catch (error) {
    if (error.response && error.response.data) {
        return res.status(500).json({ message: "Wafi API error", error: error.response.data });
    }
    res.status(500).json({ message: "Error processing booking", error: error.message });
  }
};
