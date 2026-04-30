import { prisma } from "../lib/prisma.js";

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [totalProperties, totalCategories, totalUsers, totalBookings, ownersData, saleCount, rentCount, recentListings, propertyCategories, blogCategories, latestUsers] = await Promise.all([
      prisma.property.count(),
      prisma.propertyType.count(),
      prisma.user.count({ where: { role: { name: 'User' } } }),
      prisma.booking.count(),
      prisma.user.findMany({
        where: { role: { name: 'Owner' } },
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
          propertiesOwned: { select: { id: true } }
        },
        orderBy: {
          propertiesOwned: { _count: 'desc' }
        },
        take: 5
      }),
      prisma.property.count({ where: { listingType: 'SALE' } }),
      prisma.property.count({ where: { listingType: 'RENT' } }),
      prisma.property.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { images: true }
      }),
      prisma.propertyType.findMany({
        select: {
          name: true,
          _count: {
            select: { properties: true }
          }
        }
      }),
      prisma.blogCategory.findMany({
        select: {
          name: true,
          _count: {
            select: { blogs: true }
          }
        }
      }),
      prisma.user.findMany({
        where: { role: { name: 'User' } },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          photo: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const activeListingsCount = totalProperties;

    // Aggregate monthly bookings for Bar Chart (Current Year vs Last Year)
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    // Fetch all bookings to compute chart data
    const allBookings = await prisma.booking.findMany({
      select: { createdAt: true, price: true, status: true }
    });

    const bookingsByMonth = Array.from({ length: 12 }, () => ({ a: 0, b: 0 }));
    let realTotalRevenue = 0;

    allBookings.forEach(b => {
       if (b.status === 'PAID' || b.status === 'PENDING') {
          realTotalRevenue += b.price || 0;
       }
       const d = new Date(b.createdAt);
       const month = d.getMonth();
       if (d.getFullYear() === currentYear) {
         bookingsByMonth[month].a += 1;
       } else if (d.getFullYear() === lastYear) {
         bookingsByMonth[month].b += 1;
       }
    });

    // Create daily revenue trends for the Line Chart (Current Month vs Previous Month)
    // To ensure the chart looks good even with sparse real data, we'll map real data onto an array of 30 days.
    const revenueCurrentMonth = new Array(30).fill(0);
    const revenueLastMonth = new Array(30).fill(0);
    const now = new Date();
    const currentM = now.getMonth();
    const lastM = currentM === 0 ? 11 : currentM - 1;

    allBookings.forEach(b => {
       const d = new Date(b.createdAt);
       // Just taking the day of month (1-31). Map to index 0-29.
       let dayIndex = d.getDate() - 1;
       if (dayIndex > 29) dayIndex = 29; // cap at 30 days for uniform chart

       if (d.getMonth() === currentM && d.getFullYear() === currentYear) {
           revenueCurrentMonth[dayIndex] += b.price || 0;
       } else if (d.getMonth() === lastM) {
           revenueLastMonth[dayIndex] += b.price || 0;
       }
    });

    // Calculate a mock or derived efficiency percentage (e.g. based on properties owned, or a robust random number for demo if needed). Here we'll just assign some descending realistic percentages if they exist, or calculate based on properties.
    const topUsers = ownersData.map((user, index) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        propertyCount: user.propertiesOwned.length,
      };
    });
    
    res.status(200).json({
      totalProperties,
      totalCategories,
      totalUsers,
      totalBookings,
      topUsers,
      realTotalRevenue,
      revenueCurrentMonth,
      revenueLastMonth,
      bookingsByMonth,
      saleCount,
      rentCount,
      recentListings,
      propertyCategories,
      blogCategories,
      latestUsers,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
