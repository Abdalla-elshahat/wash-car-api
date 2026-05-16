import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { services, servicesDocument } from './services.schema';
import { Laundry, LaundryDocument } from '../laundries/laundry.schema';
import { deleteOldImage } from '../helpers/helper';

@Injectable()
export class servicesService {
  constructor(
    @InjectModel(services.name) private servicesModel: Model<servicesDocument>,
    @InjectModel(Laundry.name) private laundryModel: Model<LaundryDocument>) { }

  async createservices(data: any): Promise<servicesDocument> {
    try {
      const laundryexists = await this.laundryModel.findById(data.laundryId).exec();
      if (!laundryexists) {
        throw new HttpException(
          { message: 'Laundry not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      const serviceExists = await this.servicesModel.findOne({ title: data.title, laundryId: data.laundryId }).exec();
      if (serviceExists) {
        throw new HttpException(
          { message: 'Service already exists for this laundry, please update the status or title' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const createdservices = new this.servicesModel(data);
      return await createdservices.save();
    } catch (error) {
      if (data.image) {
        deleteOldImage('services', data.image);
      }
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to create service', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllservices(laundryId: string): Promise<servicesDocument[]> {
    try {
      return await this.servicesModel.find({ laundryId }).exec();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch services', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async updateservices(id: string, data: any, userId: string): Promise<{ message: string }> {
    try {
      const service = await this.servicesModel.findById(id).exec();
      if (!service) {
        throw new HttpException(
          { message: 'Service not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (service.ownerId.toString() !== userId) {
        throw new HttpException(
          { message: 'Access denied: You are not the owner of this service' },
          HttpStatus.FORBIDDEN,
        );
      }


      const updated = await this.servicesModel.findByIdAndUpdate(id, data, {
        new: true,
      }).exec();
      if (data.image && service.image && updated) {
        deleteOldImage('services', service.image);
      }
      return { message: 'Service updated successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to update service', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteservices(id: string, userId: string): Promise<{ message: string }> {
    try {
      const service = await this.servicesModel.findById(id).exec();
      if (!service) {
        throw new HttpException(
          { message: 'Service not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (service.ownerId.toString() !== userId) {
        throw new HttpException(
          { message: 'Access denied: You are not the owner of this service' },
          HttpStatus.FORBIDDEN,
        );
      }

      if (service.image) {
        deleteOldImage('services', service.image);
      }

      await this.servicesModel.findByIdAndDelete(id).exec();
      return { message: 'Service deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to delete service', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
