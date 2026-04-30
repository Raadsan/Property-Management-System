import { prisma } from "../lib/prisma.js";

// @desc    Record a new payment
// @route   POST /api/payments
export const createPayment = async (req, res) => {
  console.log("📥 CREATE PAYMENT REQUEST:", req.body);
  const { amount, method, status, bookingId, userId, dueDate, paidAt } = req.body || {};

  if (!amount || !method || !userId) {
    return res.status(400).json({ message: "amount, method, and userId are required." });
  }

  try {
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        method,
        status,
        bookingId: bookingId ? parseInt(bookingId) : null,
        userId: parseInt(userId),
        dueDate: dueDate ? new Date(dueDate) : null,
        paidAt: paidAt ? new Date(paidAt) : null
      },
      include: {
        user: { select: { name: true, phone: true } },
        booking: {
          include: {
            property: { select: { title: true } }
          }
        }
      }
    });

    res.status(201).json({ message: "Payment recorded successfully", payment });
  } catch (error) {
    res.status(500).json({ message: "Error recording payment", error: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
export const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        booking: { select: { id: true, property: { select: { title: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
export const getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        booking: { include: { property: true } }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment", error: error.message });
  }
};

// @desc    Update a payment status/details
// @route   PATCH /api/payments/:id
export const updatePayment = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body || {};

  try {
    const data = { ...updateFields };
    if (data.amount) data.amount = parseFloat(data.amount);
    if (data.bookingId) data.bookingId = parseInt(data.bookingId);
    if (data.userId) data.userId = parseInt(data.userId);
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (data.paidAt) data.paidAt = new Date(data.paidAt);

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: data,
      include: { user: true }
    });

    res.status(200).json({ message: "Payment updated successfully", payment: updatedPayment });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Payment record not found" });
    }
    res.status(500).json({ message: "Error updating payment", error: error.message });
  }
};

// @desc    Delete a payment record
// @route   DELETE /api/payments/:id
export const deletePayment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.payment.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Payment record deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Payment record not found" });
    }
    res.status(500).json({ message: "Error deleting payment", error: error.message });
  }
};
