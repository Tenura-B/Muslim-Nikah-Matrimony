import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private getTransport() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT ?? '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      // In dev: just log the link so you can test without email config
      this.logger.warn(`[DEV] Password reset link for ${to}: ${resetUrl}`);
      return;
    }

    const transport = this.getTransport();
    try {
      await transport.sendMail({
        from: `"Muslim Nikah Matrimony" <${process.env.MAIL_USER}>`,
        to,
        subject: 'Reset Your Password — Muslim Nikah Matrimony',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <div style="background:linear-gradient(135deg,#1B6B4A,#2d9966);padding:40px 40px 32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                  🕌 Muslim Nikah Matrimony
                </h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Password Reset Request</p>
              </div>

              <!-- Body -->
              <div style="padding:40px;">
                <h2 style="margin:0 0 12px;color:#121514;font-size:20px;font-weight:600;">Reset Your Password</h2>
                <p style="margin:0 0 24px;color:#6B7280;font-size:15px;line-height:1.6;">
                  We received a request to reset the password for your account associated with <strong>${to}</strong>.
                  Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
                </p>

                <!-- CTA Button -->
                <div style="text-align:center;margin:32px 0;">
                  <a href="${resetUrl}"
                     style="display:inline-block;background:#1B6B4A;color:#ffffff;text-decoration:none;
                            padding:14px 36px;border-radius:12px;font-size:15px;font-weight:600;
                            letter-spacing:0.3px;box-shadow:0 4px 12px rgba(27,107,74,0.3);">
                    Reset My Password
                  </a>
                </div>

                <p style="margin:24px 0 0;color:#9CA3AF;font-size:13px;line-height:1.5;">
                  If you didn't request this, you can safely ignore this email — your password won't change.
                  This link will expire automatically in 1 hour.
                </p>

                <div style="margin:32px 0 0;padding:16px;background:#F9FAFB;border-radius:10px;border:1px solid #E5E7EB;">
                  <p style="margin:0;color:#6B7280;font-size:12px;">Or copy and paste this link into your browser:</p>
                  <p style="margin:6px 0 0;color:#1B6B4A;font-size:12px;word-break:break-all;">${resetUrl}</p>
                </div>
              </div>

              <!-- Footer -->
              <div style="padding:20px 40px;background:#F9FAFB;border-top:1px solid #E5E7EB;text-align:center;">
                <p style="margin:0;color:#9CA3AF;font-size:12px;">
                  © ${new Date().getFullYear()} Muslim Nikah Matrimony. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
      throw new BadRequestException('Failed to send reset email. Please try again.');
    }
  }
}
