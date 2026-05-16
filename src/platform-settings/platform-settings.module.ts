import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformSettings, PlatformSettingsSchema } from './platform-settings.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: PlatformSettings.name, schema: PlatformSettingsSchema }])],
  exports: [MongooseModule],
})
export class PlatformSettingsModule {}
