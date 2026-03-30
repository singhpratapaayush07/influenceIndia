import { Resend } from 'resend';

// Lazy initialization to avoid errors during build time
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

interface SendOtpEmailParams {
  email: string;
  otp: string;
  purpose: 'signup' | 'reset-password';
}

export async function sendOtpEmail({ email, otp, purpose }: SendOtpEmailParams) {
  const subject = purpose === 'signup'
    ? 'Verify Your Email - InfluenceIndia'
    : 'Reset Your Password - InfluenceIndia';

  const message = purpose === 'signup'
    ? 'Welcome to InfluenceIndia! Please verify your email address to continue.'
    : 'You requested to reset your password. Use the code below to create a new password.';

  try {
    const resend = getResend();
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'InfluenceIndia <noreply@influenceindia.in>',
      to: email,
      subject,
      html: getOtpEmailTemplate(otp, purpose, message),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error };
  }
}

function getOtpEmailTemplate(otp: string, purpose: string, message: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                InfluenceIndia
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px; font-weight: 600;">
                ${purpose === 'signup' ? 'Verify Your Email' : 'Reset Your Password'}
              </h2>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                ${message}
              </p>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Your verification code is:
              </p>

              <!-- OTP Code -->
              <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px;">
                <div style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>.
              </p>

              <!-- Security Warning -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 4px; margin: 24px 0 0;">
                <p style="color: #856404; font-size: 14px; line-height: 1.5; margin: 0;">
                  <strong>🔒 Security Notice:</strong> Never share this code with anyone. InfluenceIndia will never ask for your verification code.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0;">
                If you didn't request this code, please ignore this email.
              </p>
              <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 8px 0 0;">
                © 2026 InfluenceIndia. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
