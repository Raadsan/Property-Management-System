import { prisma } from "../lib/prisma.js";

// @desc    Toggle a favorite (Add or Remove)
// @route   POST /api/favorites/toggle
export const toggleFavorite = async (req, res) => {
  const { userId, propertyId } = req.body || {};

  if (!userId || !propertyId) {
    return res.status(400).json({ message: "userId and propertyId are required." });
  }

  try {
    // Check if the user exists
    const userExists = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!userExists) {
      return res.status(404).json({ message: "User not found. Please use a valid User ID." });
    }

    // Check if the property exists
    const propertyExists = await prisma.property.findUnique({ where: { id: parseInt(propertyId) } });
    if (!propertyExists) {
      return res.status(404).json({ message: "Property not found. Please use a valid Property ID." });
    }

    // Check if the favorite already exists
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: parseInt(userId),
          propertyId: parseInt(propertyId)
        }
      }
    });

    if (existing) {
      // If it exists, REMOVE it
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      return res.status(200).json({ message: "Property removed from favorites" });
    } else {
      // If it doesn't exist, ADD it
      const favorite = await prisma.favorite.create({
        data: {
          userId: parseInt(userId),
          propertyId: parseInt(propertyId)
        }
      });
      return res.status(201).json({ message: "Property added to favorites", favorite });
    }
  } catch (error) {
    res.status(500).json({ message: "Error toggling favorite", error: error.message });
  }
};

// @desc    Get favorites for a specific user
// @route   GET /api/favorites/user/:userId
export const getUserFavorites = async (req, res) => {
  const { userId } = req.params;
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: parseInt(userId) },
      include: {
        property: {
          include: { 
            images: { orderBy: { id: 'desc' }, take: 1 },
            propertyType: { select: { name: true } }
          }
        }
      }
    });
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user favorites", error: error.message });
  }
};

// @desc    Check if a specific property is favorited by a user
// @route   GET /api/favorites/check/:userId/:propertyId
export const checkFavorite = async (req, res) => {
  const { userId, propertyId } = req.params;
  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: parseInt(userId),
          propertyId: parseInt(propertyId)
        }
      }
    });

    res.status(200).json({ isFavorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: "Error checking favorite", error: error.message });
  }
};
