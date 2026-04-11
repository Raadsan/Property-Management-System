import { prisma } from "../lib/prisma.js";
import axios from "axios";

// @desc    Create a new property
// @route   POST /api/properties
export const createProperty = async (req, res) => {
  try {
    console.log("📥 CREATE PROPERTY REQUEST:", { 
      body: req.body, 
      filesCount: req.files ? req.files.length : 0 
    });

    const {
      title, description, location, city, price,
      ownerId, propertyTypeId, images: bodyImages, features: bodyFeatures,
      sizeLabel, area, listingType: bodyListingType, status: bodyStatus,
      Rooms, Bathrooms, ReservationFee
    } = req.body || {};

    const listingType = (bodyListingType || "RENT").trim().toUpperCase();
    const status = (bodyStatus || "AVAILABLE").trim().toUpperCase();

    // Validation
    if (!title || !location || !city || !price || !ownerId || !propertyTypeId) {
      return res.status(400).json({ 
        message: "Missing required fields.",
        received: { title: !!title, location: !!location, city: !!city, price: !!price, ownerId: !!ownerId, propertyTypeId: !!propertyTypeId }
      });
    }

    // Combine images from body (URLs) and files (uploads)
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (bodyImages) {
      images = Array.isArray(bodyImages) ? bodyImages : [bodyImages];
    }

    // Parse features
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

    // Safe parsing
    const parsedPrice = parseFloat(price);
    const parsedOwnerId = parseInt(ownerId);
    const parsedPropertyTypeId = parseInt(propertyTypeId);
    const parsedArea = area ? parseFloat(area) : null;
    const parsedRooms = Rooms !== undefined ? parseInt(Rooms) : 0;
    const parsedBathrooms = Bathrooms !== undefined ? parseInt(Bathrooms) : 0;
    const parsedReservationFee = ReservationFee !== undefined ? parseFloat(ReservationFee) : 0.01;

    if (isNaN(parsedPrice) || isNaN(parsedOwnerId) || isNaN(parsedPropertyTypeId)) {
      return res.status(400).json({ 
        message: "Invalid numeric values provided.",
        details: { price, ownerId, propertyTypeId }
      });
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        location,
        city,
        price: parsedPrice,
        listingType,
        status,
        Rooms: isNaN(parsedRooms) ? 0 : parsedRooms,
        Bathrooms: isNaN(parsedBathrooms) ? 0 : parsedBathrooms,
        ownerId: parsedOwnerId,
        propertyTypeId: parsedPropertyTypeId,
        sizeLabel,
        area: isNaN(parsedArea) ? null : parsedArea,
        ReservationFee: isNaN(parsedReservationFee) ? 0.01 : parsedReservationFee,
        images: images && images.length > 0 ? {
          create: images.map(url => ({ url }))
        } : undefined,
        features: features && features.length > 0 ? {
          create: features.map(name => ({ name }))
        } : undefined
      },
      include: {
        images: { orderBy: { id: 'desc' } },
        features: true
      }
    });

    return res.status(201).json({ message: "Property created successfully", property });
  } catch (error) {
    console.error("❌ CREATE PROPERTY ERROR:", error);
    // Ensure we don't send a circular object and provide maximum detail
    const errorDetails = error.message || "Unknown error";
    return res.status(500).json({ 
      message: "Server error creating property", 
      error: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get all properties
// @route   GET /api/properties
export const getProperties = async (req, res) => {
  try {
    const { city, rooms, minPrice, maxPrice, propertyTypeId } = req.query;

    const where = {};
    if (city) where.city = city;
    if (rooms) where.Rooms = parseInt(rooms);
    if (propertyTypeId) where.propertyTypeId = parseInt(propertyTypeId);
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        images: { orderBy: { id: 'desc' } },
        features: true,
        propertyType: { select: { name: true } },
        owner: { select: { name: true, phone: true } }
      }
    });
    return res.status(200).json(properties);
  } catch (error) {
    console.error("❌ GET PROPERTIES ERROR:", error);
    return res.status(500).json({ 
      message: "Error fetching properties", 
      error: error.message || "Unknown error" 
    });
  }
};

// @desc    Get property by ID
// @route   GET /api/properties/:id
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = parseInt(id);

    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID provided." });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
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

    return res.status(200).json(property);
  } catch (error) {
    console.error("❌ GET PROPERTY BY ID ERROR:", error);
    return res.status(500).json({ 
      message: "Error fetching property", 
      error: error.message || "Unknown error" 
    });
  }
};

// @desc    Update a property
// @route   PATCH /api/properties/:id
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body || {};
    const propertyId = parseInt(id);

    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID provided." });
    }

    // Process numeric and other fields
    const updateData = {};
    if (updateFields.title) updateData.title = updateFields.title;
    if (updateFields.description !== undefined) updateData.description = updateFields.description;
    if (updateFields.location) updateData.location = updateFields.location;
    if (updateFields.city) updateData.city = updateFields.city;
    if (updateFields.Rooms !== undefined) updateData.Rooms = parseInt(updateFields.Rooms) || 0;
    if (updateFields.Bathrooms !== undefined) updateData.Bathrooms = parseInt(updateFields.Bathrooms) || 0;
    if (updateFields.price) updateData.price = parseFloat(updateFields.price);
    if (updateFields.listingType) updateData.listingType = updateFields.listingType.trim().toUpperCase();
    if (updateFields.status) updateData.status = updateFields.status.trim().toUpperCase();
    
    if (updateFields.ReservationFee !== undefined) {
      const parsedResFee = parseFloat(updateFields.ReservationFee);
      updateData.ReservationFee = isNaN(parsedResFee) ? 0.01 : parsedResFee;
    }
    
    if (updateFields.ownerId) {
      updateData.ownerId = parseInt(updateFields.ownerId);
      if (isNaN(updateData.ownerId)) delete updateData.ownerId;
    }
    
    if (updateFields.propertyTypeId) {
      updateData.propertyTypeId = parseInt(updateFields.propertyTypeId);
      if (isNaN(updateData.propertyTypeId)) delete updateData.propertyTypeId;
    }

    if (updateFields.sizeLabel !== undefined) updateData.sizeLabel = updateFields.sizeLabel;
    
    if (updateFields.area !== undefined) {
      const parsedArea = parseFloat(updateFields.area);
      updateData.area = isNaN(parsedArea) ? null : parsedArea;
    }

    // Handle IMAGE REPLACEMENT
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({ url: `/uploads/${file.filename}` }));
      updateData.images = {
        deleteMany: {},
        create: newImages
      };
    }

    // Handle FEATURE REPLACEMENT
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
      where: { id: propertyId },
      data: updateData,
      include: {
        images: { orderBy: { id: 'desc' } },
        features: true
      }
    });

    return res.status(200).json({ message: "Property updated successfully", property: updatedProperty });
  } catch (error) {
    console.error("❌ UPDATE PROPERTY ERROR:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Property not found" });
    }
    return res.status(500).json({ 
      message: "Server error updating property", 
      error: error.message || "Unknown error" 
    });
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
          amount: (property.ReservationFee || 0.01).toString(),
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
          price: property.ReservationFee || 0.01
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
// @desc    Get all bookings for a specific user
// @route   GET /api/properties/user/:userId/bookings
export const getBookingsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: parseInt(userId) },
      include: {
        property: {
          include: {
            images: { orderBy: { id: "desc" } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user bookings", error: error.message });
  }
};

// @desc    Get dynamic city statistics (city names and listing counts)
// @route   GET /api/properties/stats/cities
export const getCityStats = async (req, res) => {
  try {
    const stats = await prisma.property.groupBy({
      by: ['city'],
      _count: {
        id: true,
      },
    });

    const result = stats.map(s => ({
      name: s.city,
      listings: s._count.id
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ ERROR FETCHING CITY STATS:", error);
    return res.status(500).json({ error: "Failed to fetch city statistics" });
  }
};
