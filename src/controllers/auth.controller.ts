// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { OTPService } from '../services/otp.service';
import { EmailService } from '../services/email.service';
import { generateToken } from '../utils/jwt';
import { validateLogin, validateRegister, validateEmail, validateResetPassword } from '../validations/auth.validation';

class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { error } = validateRegister(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { name, email, password, phone, role, registrationNo, category, address } = req.body;

      // Check if user exists
      const existingUser = await UserService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Create user
      const user = await AuthService.registerUser({
        name,
        email,
        password,
        phone,
        role,
        registrationNo,
        category,
        address
      });

      // Generate verification token
      const verificationToken = await AuthService.generateVerificationToken(user.id);

      // Send verification email
      await EmailService.sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({
        message: 'Registration successful. Please check your email for verification.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { error } = validateLogin(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { email, password } = req.body;

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email first' });
      }

      const isMatch = await AuthService.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user.id, user.role);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { email, token } = req.params;

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      if (user.verificationToken !== token) {
        return res.status(400).json({ message: 'Invalid verification token' });
      }

      await AuthService.verifyUserEmail(user.id);

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.params;

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      const verificationToken = await AuthService.generateVerificationToken(user.id);
      await EmailService.sendVerificationEmail(user.email, verificationToken);

      res.json({ message: 'Verification email resent successfully' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { error } = validateEmail(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { email } = req.body;

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate OTP
      const otp = OTPService.generateOTP();
      OTPService.storeOTP(email, otp);

      // Send OTP email
      await EmailService.sendOTPEmail(email, otp);

      res.json({ message: 'Password reset OTP sent to your email' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const isValid = OTPService.verifyOTP(email, otp);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      // Generate password reset token
      const resetToken = await AuthService.generatePasswordResetToken(email);

      res.json({ 
        message: 'OTP verified successfully',
        resetToken 
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { error } = validateResetPassword(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { token, newPassword } = req.body;

      const user = await AuthService.resetUserPassword(token, newPassword);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default AuthController;