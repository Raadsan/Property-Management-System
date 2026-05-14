import { prisma } from "../lib/prisma.js";

// @desc    Create a new video
// @route   POST /api/videos
export const createVideo = async (req, res) => {
  try {
    const { 
      title, description, location, city, country, price, 
      Rooms, Bathrooms, ReservationFee, listingType, status, 
      sizeLabel, area, ownerId, agentId, propertyTypeId 
    } = req.body;
    
    if (!title || !location || !city || !price || !ownerId || !propertyTypeId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }

    const videoUrl = req.file.path;

    const video = await prisma.video.create({
      data: {
        title,
        description,
        location,
        city,
        country,
        price: parseFloat(price),
        Rooms: parseInt(Rooms) || 0,
        Bathrooms: parseInt(Bathrooms) || 0,
        ReservationFee: parseFloat(ReservationFee) || 0.01,
        listingType: listingType || "RENT",
        status: status || "AVAILABLE",
        sizeLabel,
        area: area ? parseFloat(area) : null,
        videoUrl,
        ownerId: parseInt(ownerId),
        agentId: agentId ? parseInt(agentId) : null,
        propertyTypeId: parseInt(propertyTypeId),
      },
    });

    res.status(201).json({ message: "Video property uploaded successfully", video });
  } catch (error) {
    console.error("❌ CREATE VIDEO ERROR:", error);
    res.status(500).json({ message: "Error uploading video", error: error.message });
  }
};

// @desc    Get all videos
export const getVideos = async (req, res) => {
  try {
    const { userId } = req.query; // Optional: to check if user liked the video

    const include = {
      propertyType: { select: { name: true } },
      owner: { select: { name: true, phone: true } },
      agent: { select: { name: true, phone: true } },
      _count: {
        select: { videoLikes: true }
      }
    };

    if (userId) {
      include.videoLikes = {
        where: { userId: parseInt(userId) }
      };
    }

    const videos = await prisma.video.findMany({
      include,
      orderBy: { createdAt: "desc" },
    });

    const videosWithLikeStatus = videos.map(video => ({
      ...video,
      likeCount: video._count.videoLikes,
      isLiked: video.videoLikes ? video.videoLikes.length > 0 : false,
      videoLikes: undefined,
      _count: undefined
    }));

    res.status(200).json(videosWithLikeStatus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching videos", error: error.message });
  }
};

// @desc    Get video by ID
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const include = {
      propertyType: true,
      owner: { select: { name: true, email: true, phone: true, photo: true } },
      agent: { select: { name: true, email: true, phone: true, photo: true } },
      _count: {
        select: { videoLikes: true }
      }
    };

    if (userId) {
      include.videoLikes = {
        where: { userId: parseInt(userId) }
      };
    }

    const video = await prisma.video.findUnique({
      where: { id: parseInt(id) },
      include
    });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const videoWithLikeStatus = {
      ...video,
      likeCount: video._count.videoLikes,
      isLiked: video.videoLikes ? video.videoLikes.length > 0 : false,
      videoLikes: undefined,
      _count: undefined
    };

    res.status(200).json(videoWithLikeStatus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching video", error: error.message });
  }
};

// @desc    Update video
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body || {};

    const data = {};
    if (updateFields.title) data.title = updateFields.title;
    if (updateFields.description !== undefined) data.description = updateFields.description;
    if (updateFields.location) data.location = updateFields.location;
    if (updateFields.city) data.city = updateFields.city;
    if (updateFields.country) data.country = updateFields.country;
    if (updateFields.price) data.price = parseFloat(updateFields.price);
    if (updateFields.Rooms !== undefined) data.Rooms = parseInt(updateFields.Rooms) || 0;
    if (updateFields.Bathrooms !== undefined) data.Bathrooms = parseInt(updateFields.Bathrooms) || 0;
    if (updateFields.ReservationFee !== undefined) data.ReservationFee = parseFloat(updateFields.ReservationFee) || 0.01;
    if (updateFields.listingType) data.listingType = updateFields.listingType;
    if (updateFields.status) data.status = updateFields.status;
    if (updateFields.sizeLabel !== undefined) data.sizeLabel = updateFields.sizeLabel;
    if (updateFields.area !== undefined) data.area = parseFloat(updateFields.area) || null;
    
    if (updateFields.ownerId) data.ownerId = parseInt(updateFields.ownerId);
    if (updateFields.agentId !== undefined) data.agentId = updateFields.agentId ? parseInt(updateFields.agentId) : null;
    if (updateFields.propertyTypeId) data.propertyTypeId = parseInt(updateFields.propertyTypeId);

    if (req.file) {
      data.videoUrl = req.file.path;
    }

    const video = await prisma.video.update({
      where: { id: parseInt(id) },
      data,
    });

    res.status(200).json({ message: "Video updated successfully", video });
  } catch (error) {
    res.status(500).json({ message: "Error updating video", error: error.message });
  }
};

// @desc    Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.video.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting video", error: error.message });
  }
};

// @desc    Toggle like for a video
// @route   POST /api/videos/toggle-like
export const toggleLike = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    if (!userId || !videoId) {
      return res.status(400).json({ message: "userId and videoId are required" });
    }

    const existingLike = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId: parseInt(userId),
          videoId: parseInt(videoId),
        },
      },
    });

    if (existingLike) {
      await prisma.videoLike.delete({
        where: { id: existingLike.id },
      });
      return res.status(200).json({ message: "Video unliked", isLiked: false });
    } else {
      await prisma.videoLike.create({
        data: {
          userId: parseInt(userId),
          videoId: parseInt(videoId),
        },
      });
      return res.status(200).json({ message: "Video liked", isLiked: true });
    }
  } catch (error) {
    console.error("❌ TOGGLE LIKE ERROR:", error);
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
};
