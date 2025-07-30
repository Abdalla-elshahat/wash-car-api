import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { services, servicesDocument } from './services.schema';

@Injectable()
export class servicesService {
  constructor(@InjectModel(services.name) private servicesModel: Model<servicesDocument>) {}

  async createservices(data: any): Promise<servicesDocument> {
    try {
      const createdservices = new this.servicesModel(data);
      return await createdservices.save();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create service', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllservices(): Promise<servicesDocument[]> {
    try {
      return await this.servicesModel.find().exec();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch services', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByIdservices(id: string): Promise<servicesDocument> {
    try {
      const service = await this.servicesModel.findById(id).exec();
      if (!service) {
        throw new HttpException(
          { message: 'Service not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return service;
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch service', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateservices(id: string, data: any): Promise<{ message: string }> {
    try {
      const updated = await this.servicesModel.findByIdAndUpdate(id, data, {
        new: true,
      }).exec();
      if (!updated) {
        throw new HttpException(
          { message: 'Service not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'Service updated successfully' };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update service', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteservices(id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.servicesModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        throw new HttpException(
          { message: 'Service not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'Service deleted successfully' };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete service', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
