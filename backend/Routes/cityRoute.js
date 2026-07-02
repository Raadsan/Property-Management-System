import express from "express";
import {
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
} from "../controllers/cityController.js";
import { protect, requireStaff } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();

router.get("/", getCities);
router.get("/:id", getCityById);

router.post("/", protect, requireStaff, authorize("/content/city-distract", "add"), createCity);
router.patch("/:id", protect, requireStaff, authorize("/content/city-distract", "edit"), updateCity);
router.delete("/:id", protect, requireStaff, authorize("/content/city-distract", "delete"), deleteCity);

export default router;
