import { Router } from 'express';
import { DonationController } from '../controllers/donation.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Create donation (authenticated users)
router.post('/', authenticate, DonationController.createDonation);

// Get donation by ID
router.get('/:id', authenticate, DonationController.getDonationById);

// Get donations by donor
router.get('/donor/:donorId', authenticate, DonationController.getDonorDonations);

// Get donations by need
router.get('/need/:needId', authenticate, DonationController.getNeedDonations);

// Update donation status (admin only)
router.patch(
  '/:id/status',
  authenticate,
  authorize([Role.CAREHOME]),
  DonationController.updateDonationStatus
);

// Delete donation (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize([Role.CAREHOME]),
  DonationController.deleteDonation
);

export default router;