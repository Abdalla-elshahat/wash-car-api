import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Laundry, LaundryDocument } from './laundry.schema';
import { User, UserDocument } from '../users/users.schema';
import { check_owner, deleteOldImage } from '../helpers/helper';

@Injectable()
export class LaundriesService {
  constructor(
    @InjectModel(Laundry.name) private laundryModel: Model<LaundryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async create(data: any): Promise<Laundry> {
    try {
      await check_owner(this.userModel, data.ownerId);
      const createdLaundry = await this.laundryModel.create(data);
      return createdLaundry;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to create laundry', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Laundry[]> {
    try {
      return await this.laundryModel
        .find({ isActive: true }, { __v: 0 })
        .populate('ownerId', 'fullname role profileImage').exec();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch laundries', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByOwnerId(ownerId: string): Promise<Laundry[]> {
    await check_owner(this.userModel, ownerId);
    try {
      return await this.laundryModel
        .find({ ownerId, deletedAt: null }, { __v: 0, ownerId: 0 })
        .populate('ownerId', 'fullname role profileImage').exec();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to fetch owner laundries', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<Laundry> {
    try {
      const laundry = await this.laundryModel.findById(id).exec();
      if (!laundry || laundry.deletedAt) {
        throw new HttpException({ message: 'Laundry not found' }, HttpStatus.NOT_FOUND);
      }
      return laundry;
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to find laundry', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: any, user: any): Promise<Laundry> {
    try {
      await check_owner(this.userModel, user.id);
      const laundry = await this.laundryModel.findById(id).exec();
      if (!laundry) {
        throw new HttpException({ message: 'Laundry not found' }, HttpStatus.NOT_FOUND);
      }
      if (user.role !== 'admin' && laundry.ownerId?.toString() !== user.id) {
        throw new HttpException({ message: 'You do not have access to update this laundry' }, HttpStatus.FORBIDDEN);
      }

      const updatedLaundry = await this.laundryModel.findByIdAndUpdate(id, data, { new: true }).exec();
      if (!updatedLaundry) {
        throw new HttpException({ message: 'Laundry not found' }, HttpStatus.NOT_FOUND);
      }

      if (data.logo && laundry.logo && updatedLaundry) {
        deleteOldImage('laundries', laundry.logo);
      }
      return updatedLaundry;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to update laundry', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string, user: any): Promise<{ message: string }> {
    try {
      const laundry = await this.laundryModel.findById(id).exec();
      if (!laundry) {
        throw new HttpException({ message: 'Laundry not found' }, HttpStatus.NOT_FOUND);
      }

      if (user.role !== 'admin' && laundry.ownerId?.toString() !== user.id) {
        throw new HttpException({ message: 'Access denied: You do not own this laundry' }, HttpStatus.FORBIDDEN);
      }

      if (laundry.logo) {
        deleteOldImage('laundries', laundry.logo);
      }

      const result = await this.laundryModel.findByIdAndUpdate(id, { 
        deletedAt: new Date(),
        logo: null,
        isActive: false 
      }).exec();
      return { message: 'Laundry deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to delete laundry', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changeStatusLaundrybyAdmin(id: string, data: { status: string }): Promise<{ message: string }> {
    try {
      const laundry = await this.laundryModel.findById(id).exec();
      if (!laundry) {
        throw new HttpException({ message: 'Laundry not found' }, HttpStatus.NOT_FOUND);
      }
      if (!['pending', 'rejected', 'approved'].includes(data.status)) {
        throw new HttpException(
          { message: 'Invalid status' },
          HttpStatus.BAD_REQUEST,
        );
      }
      // لو Approved مينفعش تتغير تاني
      if (laundry.status === 'approved') {
        throw new HttpException(
          { message: 'Laundry has already been approved can\'t change status' },
          HttpStatus.BAD_REQUEST,
        );
      }
      const updatedLaundry = await this.laundryModel.updateOne({ _id: id }, { status: data.status, isActive: true }).exec();
      if (!updatedLaundry) {
        throw new HttpException({ message: 'Laundry not found' }, HttpStatus.NOT_FOUND);
      }
      return { message: `Laundry ${data.status} successfully` };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to change status laundry', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
