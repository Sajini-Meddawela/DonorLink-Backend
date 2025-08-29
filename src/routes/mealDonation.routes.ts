import { Router } from "express";
import { MealDonationController } from "../controllers/mealDonation.controller";

const router = Router();

router.get("/", MealDonationController.getSlots);
router.post("/", MealDonationController.createSlots);
router.post("/:id/book", MealDonationController.bookSlot);
router.get("/donor", MealDonationController.getDonorBookings);
router.patch("/:id/status", MealDonationController.updateSlotStatus);
router.delete("/:id", MealDonationController.deleteSlot); 
router.post("/:id/reserve", MealDonationController.reserveSlot); 
router.post("/:id/confirm", MealDonationController.confirmSlot); 

export default router;
