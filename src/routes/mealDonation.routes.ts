import { Router } from 'express';
import { MealDonationController } from '../controllers/mealDonation.controller';

const router = Router();

router.get('/', MealDonationController.getSlots);
router.post('/', MealDonationController.createSlots);
router.post('/:id/book', MealDonationController.bookSlot);
router.get('/donor', MealDonationController.getDonorBookings);

export default router;
