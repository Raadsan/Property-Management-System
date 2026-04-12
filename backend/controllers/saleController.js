import { prisma } from "../lib/prisma.js";

// @desc    Create a new sale
// @route   POST /api/sales
export const createSale = async (req, res) => {
  console.log("📥 CREATE SALE REQUEST:", { body: req.body, file: req.file });
  const { propertyId, buyerId, price } = req.body || {};

  if (!propertyId || !buyerId || !price) {
    return res.status(400).json({ message: "propertyId, buyerId, and price are required." });
  }

  // Handle uploaded document if present
  let documentUrl = null;
  if (req.file) {
    documentUrl = req.file.path;
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          propertyId: parseInt(propertyId),
          buyerId: parseInt(buyerId),
          price: parseFloat(price),
          documentUrl: documentUrl
        },
        include: {
          property: { include: { images: true, propertyType: true, features: true } },
          buyer: true
        }
      });

      // Automatically update property status to SOLD
      await tx.property.update({
        where: { id: parseInt(propertyId) },
        data: { status: 'SOLD' }
      });

      return newSale;
    });

    res.status(201).json({ message: "Property sale recorded successfully", sale });
  } catch (error) {
    res.status(500).json({ message: "Error recording sale", error: error.message });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
export const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        property: { include: { images: true, propertyType: true, features: true } },
        buyer: { select: { name: true, phone: true, email: true } }
      }
    });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales", error: error.message });
  }
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
export const getSaleById = async (req, res) => {
  const { id } = req.params;
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        property: { include: { images: true, propertyType: true, features: true } },
        buyer: true,
        payments: true
      }
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sale", error: error.message });
  }
};

// @desc    Update a sale
// @route   PATCH /api/sales/:id
export const updateSale = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body || {};

  // Handle new document upload
  if (req.file) {
    updateFields.documentUrl = req.file.path;
  }

  try {
    const data = { ...updateFields };
    if (data.propertyId) data.propertyId = parseInt(data.propertyId);
    if (data.buyerId) data.buyerId = parseInt(data.buyerId);
    if (data.price) data.price = parseFloat(data.price);

    const updatedSale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: data,
      include: {
        property: { include: { images: true, propertyType: true, features: true } },
        buyer: true
      }
    });

    res.status(200).json({ message: "Sale updated successfully", sale: updatedSale });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.status(500).json({ message: "Error updating sale", error: error.message });
  }
};

// @desc    Delete a sale
// @route   DELETE /api/sales/:id
export const deleteSale = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.sale.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.status(500).json({ message: "Error deleting sale", error: error.message });
  }
};
