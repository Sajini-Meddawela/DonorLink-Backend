import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // for Gmail
  host: process.env.EMAIL_HOST,       // for other services
  port: Number(process.env.EMAIL_PORT),
  secure: false,                      // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class EmailService {
  static async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: `"DonorLink" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #63C6F7;">Email Verification</h2>
          <p>Thank you for registering with DonorLink!</p>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #85C536; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">
            Verify Email
          </a>
          <p>If you didn't create an account, please ignore this email.</p>
          <p style="font-size: 12px; color: #888;">This link will expire in 24 hours.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  }

  static async sendOTPEmail(email: string, otp: string) {
    const mailOptions = {
      from: `"DonorLink" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #63C6F7;">Password Reset</h2>
          <p>We received a request to reset your password.</p>
          <p>Your OTP code is:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; 
                      padding: 10px; background: #f5f5f5; display: inline-block;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #888;">
            This OTP is valid for 5 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  }
}

export { EmailService };