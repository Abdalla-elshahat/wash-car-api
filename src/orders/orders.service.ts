import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, orderDocument, orderSchema } from './orders.schema';
import { Model } from 'mongoose';

@Injectable()
export class orderService {
  constructor( @InjectModel(Order.name) private OrdersModel: Model<orderDocument>) {}

  async createorder(data: any): Promise<orderDocument> {
    try {
      const createdOrder = new this.OrdersModel(data);
      return await createdOrder.save();
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create order', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

async findAllorder(): Promise<orderDocument[]> {
  try {
    return await this.OrdersModel.find({})
      .populate(orderSchema.path('clientId'))       // جلب بيانات العميل
      .populate('serviceId')      // جلب بيانات الخدمات
      .sort({ orderDate: -1 })    
      .exec();
  } catch (error) {
    throw new HttpException(
      { message: 'Failed to fetch orders', error: error.message },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


  async findByIdorder(id: string): Promise<orderDocument> {
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

  async deleteorder(id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.OrdersModel.findByIdAndDelete(id).exec();
      if (!deleted) {
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
