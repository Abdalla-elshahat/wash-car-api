import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './clients.schema';

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private clientModel: Model<ClientDocument>) {}

  async findAll(page: number, limit: number): Promise<{data: Client[];total: number;totalPages: number;currentPage: number}> {
    try {
      const data = await this.clientModel.find({},{ __v: 0 }).skip((page - 1) * limit).limit(limit).exec();
      const total = await this.clientModel.countDocuments().exec();
      const totalPages = Math.ceil(total / limit);
  
      return {
        data,
        total,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch clients', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  async findById(id: string): Promise<Client | null> {
    try {
      const client = await this.clientModel.findById(id,{ __v: 0 }).exec();
      if (!client) {
        throw new HttpException(
          { message: 'Client not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return client;
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to find client', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(data: any): Promise<Client> {
    try {
      const existingClient = await this.clientModel.findOne({ phonenumber: data.phonenumber }).exec();
      if (existingClient) {
        throw new HttpException(
          { message: 'Client with this phone number already exists' },
          HttpStatus.CONFLICT,
        );
      }
      const createdClient = await this.clientModel.create(data);
      return createdClient;
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create client', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: any): Promise<{ message: string }> {
    try {
      const client = await this.clientModel.findById(id).exec();
      if (!client) {
        throw new HttpException(
          { message: 'Client not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      const updatedClient = await this.clientModel.findByIdAndUpdate(id, data, { new: true }).exec();
      if (updatedClient) {
        return { message: 'Client updated successfully' };
      }
      throw new HttpException(
        { message: 'Update failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update client', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const client = await this.clientModel.findById(id).exec();
      if (!client) {
        throw new HttpException(
          { message: 'Client not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      const deletedClient = await this.clientModel.findByIdAndDelete(id).exec();
      if (deletedClient) {
        return { message: 'Client deleted successfully' };
      }
      throw new HttpException(
        { message: 'Delete failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete client', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
