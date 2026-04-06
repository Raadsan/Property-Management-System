import { prisma } from "../lib/prisma.js";

// @desc    Create a new lease
// @route   POST /api/leases
export const createLease = async (req, res) => {
  console.log("📥 CREATE LEASE REQUEST:", { body: req.body, headers: req.headers['content-type'] });
  const { propertyId, tenantId, startDate, endDate, rentAmount } = req.body || {};

  if (!propertyId || !tenantId || !startDate || !endDate || !rentAmount) {
    return res.status(400).json({ message: "Missing required fields (propertyId, tenantId, startDate, endDate, rentAmount)." });
  }

  try {
    const lease = await prisma.$transaction(async (tx) => {
      const newLease = await tx.lease.create({
        data: {
          propertyId: parseInt(propertyId),
          tenantId: parseInt(tenantId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          rentAmount: parseFloat(rentAmount)
        },
        include: {
          property: { include: { images: true, propertyType: true } },
          tenant: true
        }
      });

      // Automatically update property status to RENTED
      await tx.property.update({
        where: { id: parseInt(propertyId) },
        data: { status: 'RENTED' }
      });

      return newLease;
    });

    res.status(201).json({ message: "Lease created successfully", lease });
  } catch (error) {
    res.status(500).json({ message: "Error creating lease", error: error.message });
  }
};

// @desc    Get all leases
// @route   GET /api/leases
export const getLeases = async (req, res) => {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        property: { include: { images: true, propertyType: true } },

        tenant: true

      }
    });
    res.status(200).json(leases);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leases", error: error.message });
  }
};

// @desc    Get lease by ID
// @route   GET /api/leases/:id
export const getLeaseById = async (req, res) => {
  const { id } = req.params;
  try {
    const lease = await prisma.lease.findUnique({
      where: { id: parseInt(id) },
      include: {
        property: true,
        tenant: true,
        payments: true
      }
    });

    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    res.status(200).json(lease);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lease", error: error.message });
  }
};

// @desc    Update a lease
// @route   PATCH /api/leases/:id
export const updateLease = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body || {};

  try {
    const data = { ...updateFields };
    if (data.propertyId) data.propertyId = parseInt(data.propertyId);
    if (data.tenantId) data.tenantId = parseInt(data.tenantId);
    if (data.rentAmount) data.rentAmount = parseFloat(data.rentAmount);
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const updatedLease = await prisma.lease.update({
      where: { id: parseInt(id) },
      data: data,
      include: {
        property: { 
          include: { images: true, propertyType: true, features: true } 
        },
        tenant: true
      }
    });

    res.status(200).json({ message: "Lease updated successfully", lease: updatedLease });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Lease not found" });
    }
    res.status(500).json({ message: "Error updating lease", error: error.message });
  }
};

// @desc    Delete a lease
// @route   DELETE /api/leases/:id
export const deleteLease = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.lease.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Lease deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Lease not found" });
    }
    res.status(500).json({ message: "Error deleting lease", error: error.message });
  }
};