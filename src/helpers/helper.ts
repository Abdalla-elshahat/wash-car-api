import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

export const findById = async (model: Model<any>, id: string) => {
  return await model.findById(id).exec();
};

export const check_owner = async (userModel: Model<any>, id: string) => {
  const exitowner = await userModel.findById(id).exec();
  if (!exitowner) {
    throw new HttpException({ message: 'Owner not found' }, HttpStatus.NOT_FOUND);
  }
  if (exitowner.role !== 'laundry_owner') {
    throw new HttpException({ message: 'User is not a laundry owner' }, HttpStatus.BAD_REQUEST);
  }
};

export const deleteOldImage = (folder: string, filename: string) => {
  if (filename) {
    const filePath = path.join(process.cwd(), `uploads/${folder}`, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};
