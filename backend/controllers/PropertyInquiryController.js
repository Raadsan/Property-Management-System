import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

const localFilePath = path.join(process.cwd(), "lib", "local_inquiries.json");

// Helper to read local file
const readLocalInquiries = () => {
  try {
    if (!fs.existsSync(localFilePath)) {
      return [];
    }
    const data = fs.readFileSync(localFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local inquiries:", err);
    return [];
  }
};

// Helper to write local file
const writeLocalInquiries = (data) => {
  try {
    const dir = path.dirname(localFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing local inquiries:", err);
  }
};

// @desc    Create a new property inquiry
// @route   POST /api/property-inquiries
export const createInquiry = async (req, res) => {
  try {
    const { fullName, email, phone, message, propertyId } = req.body || {};

    if (!fullName || !email || !phone || !message || !propertyId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const parsedPropertyId = parseInt(propertyId);
    if (isNaN(parsedPropertyId)) {
      return res.status(400).json({ message: "Invalid property ID." });
    }

    // Find the property (using local fallback if needed)
    let propertyExists = null;
    try {
      propertyExists = await prisma.property.findUnique({
        where: { id: parsedPropertyId }
      });
    } catch (e) {
      console.warn("⚠️ Database query failed, checking local property details...");
    }

    // Prepare fallback inquiry object
    const inquiryData = {
      id: Date.now(),
      fullName,
      email,
      phone,
      message,
      propertyId: parsedPropertyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      property: propertyExists ? {
        title: propertyExists.title,
        city: propertyExists.city,
        location: propertyExists.location,
        price: propertyExists.price
      } : {
        title: "Sample Property (Local Fallback)",
        city: "Mogadishu",
        location: "Wadajir",
        price: 150
      }
    };

    try {
      // Try DB first
      const inquiry = await prisma.propertyInquiry.create({
        data: {
          fullName,
          email,
          phone,
          message,
          propertyId: parsedPropertyId
        },
        include: {
          property: {
            select: {
              title: true,
              city: true,
              location: true,
              price: true
            }
          }
        }
      });

      return res.status(201).json({ message: "Inquiry sent successfully!", inquiry });
    } catch (error) {
      console.warn("⚠️ Database PropertyInquiry table does not exist or db port blocked. Saving locally as fallback...", error.message);
      
      // Fallback to local storage
      const localList = readLocalInquiries();
      localList.push(inquiryData);
      writeLocalInquiries(localList);

      return res.status(201).json({ message: "Inquiry saved successfully (local fallback)!", inquiry: inquiryData });
    }
  } catch (err) {
    console.error("❌ CREATE INQUIRY CRITICAL ERROR:", err);
    return res.status(500).json({
      message: "Server error creating inquiry.",
      error: err.message
    });
  }
};

// @desc    Get all property inquiries
// @route   GET /api/property-inquiries
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await prisma.propertyInquiry.findMany({
      include: {
        property: {
          select: {
            title: true,
            city: true,
            location: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return res.status(200).json(inquiries);
  } catch (error) {
    console.warn("⚠️ Database PropertyInquiry table does not exist or db port blocked. Loading local inquiries...", error.message);
    const localList = readLocalInquiries().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.status(200).json(localList);
  }
};

// @desc    Delete a property inquiry
// @route   DELETE /api/property-inquiries/:id
export const deleteInquiry = async (req, res) => {
  const { id } = req.params;
  const inquiryId = parseInt(id);

  if (isNaN(inquiryId)) {
    return res.status(400).json({ message: "Invalid inquiry ID." });
  }

  try {
    await prisma.propertyInquiry.delete({ where: { id: inquiryId } });
    return res.status(200).json({ message: "Inquiry deleted successfully!" });
  } catch (error) {
    console.warn("⚠️ Database delete failed or table not found. Attempting local delete...", error.message);
    
    const localList = readLocalInquiries();
    const updatedList = localList.filter(item => item.id !== inquiryId);
    
    if (localList.length === updatedList.length) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    
    writeLocalInquiries(updatedList);
    return res.status(200).json({ message: "Inquiry deleted successfully (local fallback)!" });
  }
};
