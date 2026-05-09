import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  async signup(
    @Body() body: { username: string; email: string; password: string, role: string },
    @Res() res: Response,
  ) {
    const result = await this.authService.Signup(body.username, body.email, body.password, body.role || 'client');
    res.cookie('token', result.token);
    return res.status(HttpStatus.CREATED).json({ data: result });
  }

  @Post('/verify-email')
  async verifyEmail(
    @Body() body: { email: string; code: string },
    @Res() res: Response
  ) {
    try {
      const result = await this.authService.verifyEmail(body.email, body.code);
      return res.status(HttpStatus.OK).json({
        data: result
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message || 'email verification failed',
      });
    }
  }

  @Post('/Resend-otp-email')
  async Resendotpverify(
    @Body() body: { email: string },
    @Res() res: Response
  ) {
    try {
      const result = await this.authService.resendOtpVerify(body.email);
      return res.status(HttpStatus.OK).json({
        data: result
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message || 'email verification failed',
      });
    }
  }

  @Post('/login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.login(body.email, body.password);

      res.cookie('token', result.token);

      return res.status(HttpStatus.OK).json({
        data: result
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message || 'Login failed',
      });
    }
  }

  @Post('/change-password')
  async changePassword(
    @Body() body: { email: string; oldpass: string; newpass: string },
    @Res() res: Response
  ) {
    try {
      const result = await this.authService.changePassword(body.email, body.oldpass, body.newpass);
      return res.status(HttpStatus.OK).json({
        data: result
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message || 'Change password failed',
      });
    }
  }

  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }
  @Post('/verifyOtpForResetPassword')
  async verifyOtpForResetPassword(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verifyOtpForResetPassword(email, otp);
  }
  @Post('/resendOtpForgetPassword')
  async resendOtpForgetPassword(@Body('email') email: string) {
    return this.authService.resendOtpForgetPassword(email);
  }

  @Post('/reset-password')
  async resetPassword(
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(otp, newPassword);
  }
}
