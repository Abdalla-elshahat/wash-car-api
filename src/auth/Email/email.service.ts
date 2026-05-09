// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || "abdallaelshahat58@gmail.com",
      pass: process.env.EMAIL_PASS || "elkv drhw eqng xuaf",
    },
  });

  async sendOtpEmail(to: string, otp: string) {
    const mailOptions = {
      from: `"WashCar App" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your OTP Code for WashCar',
      text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
