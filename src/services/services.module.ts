import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { services, servicesSchema } from './services.schema';
import { servicesController } from './services.controller';
import { servicesService } from './services.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
    imports: [MongooseModule.forFeature([{ name: services.name, schema: servicesSchema }]),
    MulterModule.register({
        storage: diskStorage({
            destination: './uploads/services',
            filename: (req, file, callback) => {
                const uniqueName = Date.now() + '-' + file.originalname;
                callback(null, uniqueName);
            },
        }),
    }),],
    controllers: [servicesController],
    providers: [servicesService],
    exports: [servicesService],
})
export class servicesModule {

}
