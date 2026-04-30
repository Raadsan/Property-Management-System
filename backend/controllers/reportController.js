import { prisma } from "../lib/prisma.js";

export const getTransactionReport = async (req, res) => {
  try {
    // We use Bookings to calculate revenue to match the Dashboard logic
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        property: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    let totalRevenue = 0;
    let pendingRevenue = 0;

    const transactions = bookings.map(b => {
      if (b.status === 'PAID') {
        totalRevenue += (b.price || 0);
      } else if (b.status === 'PENDING') {
        pendingRevenue += (b.price || 0);
      }

      return {
        id: b.id,
        user: b.user,
        booking: { property: b.property },
        amount: b.price || 0,
        status: b.status,
        createdAt: b.createdAt
      };
    });

    // To perfectly match the dashboard's "Total Revenue", we might sum both,
    // but separating them into Paid/Confirmed vs Pending gives a better report.
    res.status(200).json({ payments: transactions, totalRevenue, pendingRevenue });
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction report", error: error.message });
  }
};

export const getPropertyReport = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        owner: { select: { name: true } },
        propertyType: { select: { name: true } },
        _count: {
          select: { bookings: true, favorites: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalProperties = properties.length;
    const availableProperties = properties.filter(p => p.status === 'AVAILABLE').length;
    const bookedProperties = properties.filter(p => p.status === 'BOOKED').length;

    res.status(200).json({ properties, totalProperties, availableProperties, bookedProperties });
  } catch (error) {
    res.status(500).json({ message: "Error fetching property report", error: error.message });
  }
};

export const getCategoryReport = async (req, res) => {
  try {
    const categories = await prisma.propertyType.findMany({
      include: {
        _count: {
          select: { properties: true }
        }
      }
    });

    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Error fetching category report", error: error.message });
  }
};

export const getUserActivityReport = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: { select: { name: true } },
        _count: {
          select: { bookings: true, payments: true, propertiesOwned: true }
        },
        bookings: {
          where: { status: 'PAID' },
          select: { id: true, price: true }
        },
        payments: {
          where: { status: 'PAID' },
          select: { amount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Process users to include total amount paid
    const processedUsers = users.map(u => {
      // Sum up explicit payment records (ensure they are treated as numbers)
      const paymentsAmount = u.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      
      // Sum up bookings (ensure they are treated as numbers)
      const bookingsAmount = u.bookings.reduce((sum, b) => sum + Number(b.price || 0), 0);
      
      const totalPaid = Math.max(paymentsAmount, bookingsAmount);

      return {
        ...u,
        totalPaid: isNaN(totalPaid) ? 0 : totalPaid,
        _count: {
          ...u._count,
          payments: Math.max(u._count.payments, u.bookings.length)
        }
      };
    });

    const totalUsers = processedUsers.length;
    const activeUsers = processedUsers.filter(u => u.status === 'ACTIVE').length;

    res.status(200).json({ users: processedUsers, totalUsers, activeUsers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user activity report", error: error.message });
  }
};
