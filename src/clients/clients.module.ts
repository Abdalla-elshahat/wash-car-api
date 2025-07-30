// clients/clients.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client, ClientSchema } from './clients.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),],
  controllers: [ ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
