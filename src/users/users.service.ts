import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { deleteOldImage } from '../helpers/helper';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async getAllUsers(page: number, limit: number): Promise<{ data: User[]; total: number; totalPages: number; currentPage: number }> {
    try {
      const query: any = { deletedAt: null };
      const data = await this.userModel.find(query, { __v: 0, password: 0 }).skip((page - 1) * limit).limit(limit).exec();
      const total = await this.userModel.countDocuments(query).exec();
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch users', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ _id: userId, deletedAt: null }, { __v: 0, password: 0 }).exec();
      if (!user) {
        throw new HttpException(
          { message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to find user', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateProfile(data: any, userId: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new HttpException(
          { message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      const updatedUser = await this.userModel.findByIdAndUpdate(userId, data, { new: true }).exec();
      if (updatedUser) {
        if (data.profileImage && user.profileImage && updatedUser) {
          deleteOldImage('users', user.profileImage);
        }
        return { message: 'User updated successfully' };
      }
      throw new HttpException(
        { message: 'Update failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to update user', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async softDeleteUser(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user || user.deletedAt) {
        throw new HttpException(
          { message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      const deletedUser = await this.userModel.findByIdAndUpdate(userId, { deletedAt: new Date() }, { new: true }).exec();
      if (deletedUser) {
        if (user.profileImage) {
          deleteOldImage('users', user.profileImage);
        }
        return { message: 'User deleted successfully' };
      }
      throw new HttpException(
        { message: 'Delete failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete user', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async returnUserbyAdmin(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user || !user.deletedAt) {
        throw new HttpException(
          { message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      const returnedUser = await this.userModel.findByIdAndUpdate(userId, { deletedAt: null }, { new: true }).exec();
      if (returnedUser) {
        return { message: 'User returned successfully' };
      }
      throw new HttpException(
        { message: 'Return failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to return user', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
