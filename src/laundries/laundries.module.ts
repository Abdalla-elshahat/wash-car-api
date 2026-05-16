import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LaundriesService } from './laundries.service';
import { LaundriesController } from './laundries.controller';
import { Laundry, LaundrySchema } from './laundry.schema';
import { User, UserSchema } from '../users/users.schema';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Laundry.name, schema: LaundrySchema },
      { name: User.name, schema: UserSchema },
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/laundries',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          callback(null, uniqueName);
        },
      }),
    }),
  ],
  controllers: [LaundriesController],
  providers: [LaundriesService],
  exports: [LaundriesService],
})
export class LaundriesModule { }
