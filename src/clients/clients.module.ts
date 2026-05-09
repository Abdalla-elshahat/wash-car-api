// clients/clients.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client, ClientSchema } from './clients.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),AuthModule],
  controllers: [ ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
