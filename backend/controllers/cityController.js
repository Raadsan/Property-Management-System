import { prisma } from "../lib/prisma.js";

export const createCity = async (req, res) => {
  const { name, order, isDefault, districts } = req.body;
  if (!name) return res.status(400).json({ message: "City name is required" });

  try {
    if (isDefault) {
      await prisma.city.updateMany({ data: { isDefault: false } });
    }

    const data = {
      name,
      order: order !== undefined ? parseInt(order) : 0,
      isDefault: Boolean(isDefault),
    };

    if (districts && Array.isArray(districts)) {
      data.districts = {
        create: districts.map((d) => ({
          name: d.name,
          order: d.order !== undefined ? parseInt(d.order) : 0,
        })),
      };
    }

    const city = await prisma.city.create({
      data,
      include: {
        districts: { orderBy: { order: "asc" } },
      },
    });

    res.status(201).json({ message: "City created successfully", city });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "City name already exists" });
    }
    res.status(500).json({ message: "Error creating city", error: error.message });
  }
};

export const getCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { order: "asc" },
      include: {
        districts: { orderBy: { order: "asc" } },
      },
    });
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cities", error: error.message });
  }
};

export const getCityById = async (req, res) => {
  const { id } = req.params;
  try {
    const city = await prisma.city.findUnique({
      where: { id: parseInt(id) },
      include: {
        districts: { orderBy: { order: "asc" } },
      },
    });
    if (!city) return res.status(404).json({ message: "City not found" });
    res.status(200).json(city);
  } catch (error) {
    res.status(500).json({ message: "Error fetching city", error: error.message });
  }
};

export const updateCity = async (req, res) => {
  const { id } = req.params;
  const { name, order, isDefault, districts } = req.body;

  try {
    if (isDefault) {
      await prisma.city.updateMany({
        where: { id: { not: parseInt(id) } },
        data: { isDefault: false },
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (order !== undefined) updateData.order = parseInt(order);
    if (isDefault !== undefined) updateData.isDefault = Boolean(isDefault);

    if (districts && Array.isArray(districts)) {
      const existingCity = await prisma.city.findUnique({
        where: { id: parseInt(id) },
        include: { districts: true },
      });

      const existingDistrictIds = existingCity?.districts.map((d) => d.id) || [];
      const incomingDistrictIds = districts
        .filter((d) => d.id)
        .map((d) => parseInt(d.id));

      const idsToDelete = existingDistrictIds.filter(
        (districtId) => !incomingDistrictIds.includes(districtId)
      );

      updateData.districts = {
        deleteMany: { id: { in: idsToDelete } },
        update: districts
          .filter((d) => d.id)
          .map((d) => ({
            where: { id: parseInt(d.id) },
            data: {
              name: d.name,
              order: d.order !== undefined ? parseInt(d.order) : 0,
            },
          })),
        create: districts
          .filter((d) => !d.id)
          .map((d) => ({
            name: d.name,
            order: d.order !== undefined ? parseInt(d.order) : 0,
          })),
      };
    }

    const updatedCity = await prisma.city.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        districts: { orderBy: { order: "asc" } },
      },
    });

    res.status(200).json({ message: "City updated successfully", city: updatedCity });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "City not found" });
    }
    if (error.code === "P2002") {
      return res.status(400).json({ message: "City or district name already exists" });
    }
    res.status(500).json({ message: "Error updating city", error: error.message });
  }
};

export const deleteCity = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.city.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "City deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "City not found" });
    }
    res.status(500).json({ message: "Error deleting city", error: error.message });
  }
};
