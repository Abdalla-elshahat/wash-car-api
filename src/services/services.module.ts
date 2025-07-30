import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { services, servicesSchema } from './services.schema';
import { servicesController } from './services.controller';
import { servicesService } from './services.service';


@Module({
    imports: [MongooseModule.forFeature([{ name: services.name, schema: servicesSchema }]),],
    controllers: [servicesController],
    providers: [servicesService],
    exports: [servicesService],
})
export class servicesModule { }
