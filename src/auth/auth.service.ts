import * as bcrypt from 'bcrypt';
import {  JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Client, ClientDocument } from 'src/clients/clients.schema';
import { InjectModel } from '@nestjs/mongoose';
import { EmailService } from './Email/email.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

async Signup(username: string, email: string, password: string, role?: string): Promise<any> {
  const existing = await this.clientModel.findOne({ email });
  if (existing) {
    throw new HttpException({ message: 'Email already exists' }, HttpStatus.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  const newUser = new this.clientModel({
    username,
    email,
    password: hashedPassword,
    role:role||'client',
    otpCode,
    otpExpires,
    isVerified: false,
  });

  await newUser.save();

  try {
    // ✅ إرسال OTP فعليًا
    await this.emailService.sendOtpEmail(email, otpCode);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    // You might want to throw a specific error here or handle it differently
    throw new HttpException({ message: 'User created but failed to send verification email. Please try resending OTP.' }, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const token = await this.jwtService.signAsync({ id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role });

  return {
    message: 'Registration successful. Please verify your email using the OTP sent.',
    token,
  };
}

async verifyEmail(email: string, code: string): Promise<any> {
  const user = await this.clientModel.findOne({ email });

  if (!user) {
    throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new HttpException({ message: 'User already verified' }, HttpStatus.BAD_REQUEST);
  }

  if (user.otpCode !== code ||!user.otpExpires ||user.otpExpires < Date.now()) {
    throw new HttpException({ message: 'Invalid or expired OTP' }, HttpStatus.BAD_REQUEST);
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;

  await user.save();

  return { message: 'Email verified successfully' };
}

async resendOtpVerify(email: string): Promise<any> {
  const user = await this.clientModel.findOne({ email });

  if (!user) {
    throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new HttpException({ message: 'User already verified' }, HttpStatus.BAD_REQUEST);
  }

  // توليد OTP جديد
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 دقائق

  user.otpCode = otpCode;
  user.otpExpires = otpExpires;

  await user.save();

  // إرسال الكود عبر البريد
  await this.emailService.sendOtpEmail(email, otpCode);

  return { message: 'A new OTP has been sent to your email.' };
}


async login(email: string, pass: string): Promise<any> {
  const existingClient = await this.clientModel.findOne({ email });
  if (!existingClient) {
    throw new HttpException({ message: 'User not found' }, HttpStatus.BAD_REQUEST);
  }

  if (!existingClient.password || typeof existingClient.password !== 'string') {
    throw new HttpException({ message: 'User password is invalid' }, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const comparedPassword = await bcrypt.compare(pass, existingClient.password);
  if (!comparedPassword) {
    throw new HttpException({ message: 'Password incorrect' }, HttpStatus.UNAUTHORIZED);
  }

  if (!existingClient.isVerified) {
    throw new HttpException(
      { message: 'Email not verified. Please verify your email first.' },
      HttpStatus.UNAUTHORIZED,
    );
  }

  const token = await jwt.sign(
    {
      id: existingClient._id,
      username: existingClient.username,
      email: existingClient.email,
      role: existingClient.role,
    },
    process.env.JWT_SECRET || 'mySecretKey',
  );

  return {
    message: 'User login successfully',
    user: {
      id: existingClient._id,
      username: existingClient.username,
      email: existingClient.email,
      role: existingClient.role,
    },
    token,
  };
}


async changePassword(email: string, oldpass: string, newpass: string): Promise<any> {
  const existingClient = await this.clientModel.findOne({ email }).exec();

  if (!existingClient) {
    throw new HttpException(
      { message: 'User not found' },
      HttpStatus.BAD_REQUEST,
    );
  }

  if (!existingClient.password || typeof existingClient.password !== 'string') {
    throw new HttpException(
      { message: 'User password is invalid' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (!existingClient.isVerified) {
    throw new HttpException(
      { message: 'Email not verified. Please verify your email first.' },
      HttpStatus.UNAUTHORIZED,
    );
  }

  const comparedPassword = await bcrypt.compare(oldpass, existingClient.password);
  if (!comparedPassword) {
    throw new HttpException(
      { message: 'Old password is incorrect' },
      HttpStatus.UNAUTHORIZED,
    );
  }

  if (newpass === oldpass) {
    throw new HttpException(
      { message: 'New password should be different' },
      HttpStatus.BAD_REQUEST,
    );
  }

  const hashedNewPassword = await bcrypt.hash(newpass, 10);
  existingClient.password = hashedNewPassword;
  await existingClient.save();

  return {
    message: 'Password changed successfully',
  };
}



async resetPassword(otp: string, newPassword: string): Promise<any> {
  const user = await this.clientModel.findOne({
    resetPasswordOTP: otp,
    resetPasswordExpires: { $gt: new Date() }, // ✅ OTP لسه صالح
  });

  if (!user) {
    throw new HttpException(
      { message: 'Invalid or expired OTP' },
      HttpStatus.BAD_REQUEST,
    );
  }

  if (!newPassword || newPassword.length < 8) {
    throw new HttpException(
      { message: 'New password must be at least 8 characters long' },
      HttpStatus.BAD_REQUEST,
    );
  }

  if (!user.isVerified) {
    throw new HttpException(
      { message: 'Email not verified. Please verify your email first.' },
      HttpStatus.UNAUTHORIZED,
    );
  }

  // ✅ تحديث كلمة المرور ومسح OTP
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: 'Password has been reset successfully' };
}



async forgotPassword(email: string): Promise<any> {
  const user = await this.clientModel.findOne({ email }).exec();

  if (!user) {
    throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
  }

  // توليد OTP مكون من 6 أرقام
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // حفظ OTP وتاريخ الانتهاء (10 دقائق)
  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // إرسال OTP على الإيميل
  await this.emailService.sendOtpEmail(email, otp);

  return { message: 'An OTP has been sent to your email for password reset.' };
}

async verifyOtpForResetPassword(email: string, otpCode: string): Promise<any> {
  const user = await this.clientModel.findOne({
    email,
    resetPasswordOTP: otpCode,
    resetPasswordExpires: { $gt: new Date() }, // لم ينتهي بعد
  });

  if (!user) {
    throw new HttpException({ message: 'Invalid or expired OTP' }, HttpStatus.BAD_REQUEST);
  }

  return { message: 'OTP verified successfully' };
}

async resendOtpForgetPassword(email: string): Promise<any> {
  const user = await this.clientModel.findOne({ email }).exec();

  if (!user) {
    throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
  }

  // توليد OTP جديد
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // إرسال OTP على الإيميل
  await this.emailService.sendOtpEmail(email, otp);

  return { message: 'A new OTP has been sent to your email for password reset.' };
}
}
