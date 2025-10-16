import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { OTPService } from "../services/otp.service";
import { EmailService } from "../services/email.service";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  validateLogin,
  validateRegister,
  validateEmail,
  validateResetPassword,
} from "../validations/auth.validation";

const prisma = new PrismaClient();

class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { error } = validateRegister(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const {
        name,
        email,
        password,
        phone,
        role,
        registrationNo,
        category,
        address,
      } = req.body;

      // Check for existing email
      const existingUser = await UserService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      try {
        const user = await AuthService.registerUser({
          name,
          email,
          password,
          phone,
          role,
          registrationNo,
          category,
          address,
        });

        // Generate verification token
        const verificationToken = await AuthService.generateVerificationToken(
          user.id
        );

        await EmailService.sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
          message:
            "Registration successful. Please check your email for verification.",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error: any) {
        if (error.message === "REGISTRATION_NUMBER_EXISTS") {
          return res.status(400).json({ 
            message: "Registration number already exists. Please use a different registration number." 
          });
        }
        throw error;
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { error } = validateLogin(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const { email, password } = req.body;

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isVerified) {
        return res
          .status(403)
          .json({ message: "Please verify your email first" });
      }

      const isMatch = await AuthService.comparePassword(
        password,
        user.password
      );
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.role);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { email, token } = req.params;

      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { email },
          select: {
            id: true,
            isVerified: true,
            verificationToken: true,
            role: true,
          },
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Check verification status FIRST
        if (user.isVerified) {
          return res.status(200).json({
            success: true,
            message: "Email verified",
            role: user.role,
          });
        }

        // Then verify token matches
        if (user.verificationToken !== token) {
          return res.status(400).json({
            success: false,
            message: "Invalid verification token",
          });
        }

        // Update and clear token
        await tx.user.update({
          where: { id: user.id },
          data: {
            isVerified: true,
            verificationToken: null,
          },
        });

        return res.json({
          success: true,
          message: "Email verified successfully",
          role: user.role,
        });
      });
    } catch (error) {
      console.error("Verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.params;

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const verificationToken = await AuthService.generateVerificationToken(
        user.id
      );
      await EmailService.sendVerificationEmail(user.email, verificationToken);

      res.json({ message: "Verification email resent successfully" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { error } = validateEmail(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const { email } = req.body;

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const otp = OTPService.generateOTP();
      OTPService.storeOTP(email, otp);

      await EmailService.sendOTPEmail(email, otp);

      res.json({ message: "Password reset OTP sent to your email" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      const isValid = OTPService.verifyOTP(email, otp);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const resetToken = await AuthService.generatePasswordResetToken(email);

      res.json({
        message: "OTP verified successfully",
        resetToken,
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { error } = validateResetPassword(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { email, token, newPassword } = req.body;

      // Find user by email and reset token
      const user = await prisma.user.findFirst({
        where: {
          email,
          resetToken: token,
          resetTokenExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          isVerified: req.user.isVerified,
        },
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AuthController;