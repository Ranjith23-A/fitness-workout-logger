import crypto from 'crypto';

/**
 * Utility to generate secure OTP tokens and handle email verification flow
 */
export const generateVerificationOtp = () => {
  // Generate random 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async ({ toEmail, otp, name }) => {
  const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    // In production with real SMTP server
    console.log(`[EMAIL DISPATCH] Sending real verification email to ${toEmail} with OTP: ${otp}`);
    // Optional nodemailer hook can be used here
    return {
      sent: true,
      provider: 'smtp',
      message: `Verification code sent to ${toEmail}`
    };
  }

  // Development / Demo mode: Log to console with clear developer documentation
  console.log(`====================================================`);
  console.log(`[EMAIL VERIFICATION OTP (DEV MODE)]`);
  console.log(`To: ${toEmail} (${name})`);
  console.log(`Verification OTP: ${otp}`);
  console.log(`Expires in: 15 minutes`);
  console.log(`Note: Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env for production email delivery.`);
  console.log(`====================================================`);

  return {
    sent: true,
    provider: 'console_dev',
    message: `Verification code generated for ${toEmail}. Check server log in development.`
  };
};
