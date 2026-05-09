import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Client, ClientSchema } from 'src/clients/clients.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from './Email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
    JwtModule.register({secret: process.env.JWT_SECRET || 'mySecretKey',signOptions: { expiresIn: '1d' }}),
    EmailModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
