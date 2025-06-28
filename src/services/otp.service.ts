// src/services/otp.service.ts
const otpStore: Record<string, { otp: string; timestamp: number }> = {};
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

class OTPService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static storeOTP(email: string, otp: string): void {
    otpStore[email] = {
      otp,
      timestamp: Date.now()
    };
  }

  static verifyOTP(email: string, otp: string): boolean {
    const stored = otpStore[email];
    if (!stored) return false;

    // Check if OTP is expired
    if (Date.now() - stored.timestamp > OTP_EXPIRY) {
      delete otpStore[email];
      return false;
    }

    // Check if OTP matches
    if (stored.otp !== otp) return false;

    // OTP is valid, remove it from storage
    delete otpStore[email];
    return true;
  }
}

export { OTPService };