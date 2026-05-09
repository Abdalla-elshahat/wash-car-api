import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, orderDocument, orderSchema } from './orders.schema';
import { Model } from 'mongoose';
import { Client, ClientDocument } from 'src/clients/clients.schema';

@Injectable()
export class orderService {
  constructor(
     @InjectModel(Order.name) private OrdersModel: Model<orderDocument>,
    @InjectModel(Client.name) private ClientModel: Model<ClientDocument>
) {}

async findOrdersByFilters(filters: any, skip: number, limit: number): Promise<[orderDocument[], number]> {
  const query: any = {};

  if (filters.status) query.status = filters.status;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  if (filters.clientId) query.clientId = filters.clientId;
  if (filters.serviceId) query.serviceId = { $in: [filters.serviceId] };
  if (filters.cartype) query.cartype = filters.cartype;

  const [orders, total] = await Promise.all([
    this.OrdersModel.find(query)
      .populate('clientId')
      .populate('serviceId')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),

    this.OrdersModel.countDocuments(query),
  ]);

  return [orders, total];
}

async createorder(data: any): Promise<orderDocument> {
  try {
    const createdOrder = new this.OrdersModel(data);
    const savedOrder = await createdOrder.save();

    if (data.clientId) {
      await this.ClientModel.findByIdAndUpdate(
        data.clientId,
        { $push: { orders: savedOrder._id } },
        { new: true }
      );
    }

    return savedOrder;

  } catch (error) {
    throw new HttpException(
      { message: 'Failed to create order', error: error.message },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

  async findorderById(id: string): Promise<orderDocument> {
    try {
      const order = await this.OrdersModel.findById(id).exec();
      if (!order) {
        throw new HttpException(
          { message: 'Order not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return order;
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch order', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findordertoday(): Promise<orderDocument[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      return await this.OrdersModel.find({
        orderDate: { $gte: startOfDay, $lte: endOfDay },
      }).exec();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch today orders', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async updateorder(id: string, data: any): Promise<{ message: string }> {
    try {

      const client= await this.ClientModel.findById(data.clientId).exec();
       const order= await this.OrdersModel.findById(id).exec();
      if (!client) {
        throw new HttpException(
          { message: 'Client not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (order?.status === 'completed') {
        throw new HttpException(
          { message: 'sorry Order already completed' },
          HttpStatus.NOT_FOUND,
        );
      }
      const updated = await this.OrdersModel.findByIdAndUpdate(id, data, {
        new: true,
      }).exec();
      if (!updated) {
        throw new HttpException(
          { message: 'Order not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'Order updated successfully' };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update order', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
async updateorderstatus(id: string, data: any): Promise<{ message: string }> {
  try {
    const client = await this.ClientModel.findById(data.clientId).exec();
    const order = await this.OrdersModel.findById(id).exec();

    if (!client) {
      throw new HttpException(
        { message: 'Client not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (!order) {
      throw new HttpException(
        { message: 'Order not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    // ✅ شرط السماح فقط لو اليوزر Admin
    if (client.role !== 'admin') {
      throw new HttpException(
        { message: 'Only admin can update order status' },
        HttpStatus.FORBIDDEN,
      );
    }
    const updated = await this.OrdersModel.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();

    if (!updated) {
      throw new HttpException(
        { message: 'Order not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return { message: 'Order updated successfully' };

  } catch (error) {
    throw new HttpException(
      { message: 'Failed to update order', error: error.message },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

  

  async deleteorder(id: string,clientId:string): Promise<{ message: string }> {
    try {
      const client= await this.ClientModel.findById(clientId).exec();
       const order= await this.OrdersModel.findById(id).exec();
      if (!client) {
        throw new HttpException(
          { message: 'Client not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (order?.status === 'completed') {
        throw new HttpException(
          { message: 'sorry Order already completed You can not delete' },
          HttpStatus.NOT_FOUND,
        );
      }
      const deleted = await this.OrdersModel.findByIdAndDelete(id).exec();
      const detetedfromClient = await this.ClientModel.findByIdAndUpdate(
        clientId,
        { $pull: { orders: id } },
        { new: true }
      )
      if (!deleted||!detetedfromClient) {
        throw new HttpException(
          { message: 'Order not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'Order deleted successfully' };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete order', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
