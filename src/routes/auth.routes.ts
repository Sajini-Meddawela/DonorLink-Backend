// src/routes/auth.routes.ts
import express from 'express';
import AuthController from '../controllers/auth.controller';

const router = express.Router();

// Authentication routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/verify/:email/:token', AuthController.verifyEmail);
router.post('/resend-verification/:email', AuthController.resendVerification);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/reset-password', AuthController.resetPassword);

export default router;