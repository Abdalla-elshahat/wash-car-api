import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './orders.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/users.schema';
import { OrderStatusHistory, OrderStatusHistoryDocument } from './schemas/order-status-history.schema';
import { Laundry, LaundryDocument } from '../laundries/laundry.schema';
import { services, servicesDocument } from '../services/services.schema';

@Injectable()
export class orderService {
  constructor(
    @InjectModel(Order.name) private OrdersModel: Model<OrderDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(OrderStatusHistory.name) private StatusHistoryModel: Model<OrderStatusHistoryDocument>,
    @InjectModel(Laundry.name) private laundryModel: Model<LaundryDocument>,
    @InjectModel(services.name) private servicesModel: Model<servicesDocument>,
  ) { }

  async getOrdersbyownerId(laundryId: string, filters: any, skip: number, limit: number, ownerId: string): Promise<[OrderDocument[], number]> {
    // Verify that the laundry belongs to the owner
    const laundry = await this.laundryModel.findById(laundryId).exec();
    if (!laundry || laundry?.ownerId?.toString() != ownerId) {
      console.log(laundry?.ownerId?.toString(), ownerId);
      throw new HttpException({ message: 'Forbidden access to this laundry orders' }, HttpStatus.FORBIDDEN);
    }
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
    if (filters.clientId) query.clientId = filters.clientId;
    if (filters.serviceId) query.serviceId = { $in: [filters.serviceId] };
    if (filters.cartype) query.cartype = filters.cartype;
    if (filters.date) query.createdAt = { $gte: startOfDay, $lte: endOfDay };

    const [orders, total] = await Promise.all([
      this.OrdersModel.find({
        laundryId,
        ...query,
      })
        .populate('clientId', 'fullname phone')
        .populate('serviceId', 'title price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.OrdersModel.countDocuments({
        laundryId,
        ...query,
      })
    ]);

    return [orders, total];
  }

  async getOrdersByClient(clientId: string, skip: number, limit: number): Promise<[OrderDocument[], number]> {
    const [orders, total] = await Promise.all([
      this.OrdersModel.find({ clientId })
        .populate('laundryId', 'name address phone logo')
        .populate('serviceId', 'title image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.OrdersModel.countDocuments({ clientId }),
    ]);
    return [orders, total];
  }

  async createorder(data: any, clientId: string) {
    data.clientId = clientId;
    const laundry = await this.laundryModel.findById(data.laundryId).exec();
    if (!laundry) {
      throw new HttpException(
        { message: 'Laundry not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    const service = await this.servicesModel.findById(data.serviceId).exec();
    if (!service) {
      throw new HttpException(
        { message: 'Service not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      const createdOrder = new this.OrdersModel(data);
      const savedOrder = await createdOrder.save();

      // Record initial status history
      await new this.StatusHistoryModel({
        orderId: savedOrder._id,
        status: savedOrder.status || 'pending',
        changedBy: data.clientId,
      }).save();

      if (data.clientId) {
        await this.UserModel.findByIdAndUpdate(
          data.clientId,
          { $push: { orders: savedOrder._id } },
          { new: true }
        );
      }

      return {
        message: 'Order created successfully',
      };

    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create order', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateorder(id: string, data: any, clientId: string): Promise<{ message: string }> {
    data.clientId = clientId;
    try {
      const order = await this.OrdersModel.findById(id).exec();
      if (!order) {
        throw new HttpException(
          { message: 'Order not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (order?.status === 'completed') {
        throw new HttpException(
          { message: 'sorry Order already completed' },
          HttpStatus.BAD_REQUEST,
        );
      }
      const allowedStatuses = [
        'pending',
        'accepted',
        'in_progress',
        'completed',
        'cancelled',
      ];

      if (!allowedStatuses.includes(data.status)) {
        throw new HttpException(
          {
            message: `Status must be one of: ${allowedStatuses.join(', ')}`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const updated = await this.OrdersModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
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

  async updateorderstatus(id: string, data: any, ownerId: string): Promise<{ message: string }> {
    try {
      const order = await this.OrdersModel.findById(id).exec();

      if (!order) {
        throw new HttpException(
          { message: 'Order not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      const allowedStatuses = [
        'pending',
        'accepted',
        'in_progress',
        'completed',
        'cancelled',
      ];

      if (!allowedStatuses.includes(data.status)) {
        throw new HttpException(
          {
            message: `Status must be one of: ${allowedStatuses.join(', ')}`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const updated = await this.OrdersModel.findByIdAndUpdate(id, { status: data.status }, {
        new: true,
        runValidators: true,
      }).exec();

      if (updated) {
        // Record status history
        await new this.StatusHistoryModel({
          orderId: updated._id,
          status: updated.status,
          changedBy: ownerId,
        }).save();
      } else {
        throw new HttpException(
          { message: 'Order not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      return { message: 'Order status updated successfully' };

    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { message: 'Failed to update order status', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  async cancelorder(id: string, clientId: string): Promise<{ message: string }> {
    try {
      const order = await this.OrdersModel.findById(id).exec();
      if (!order) {
        throw new HttpException(
          { message: 'Order not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (order?.status === 'completed' || order?.status === 'in_progress') {
        throw new HttpException(
          { message: `sorry Order already ${order.status} You can not cancel` },
          HttpStatus.BAD_REQUEST,
        );
      }
      const deleted = await this.OrdersModel.findByIdAndUpdate(id, { status: 'cancelled' }).exec();
      if (clientId) {
        await new this.StatusHistoryModel({
          orderId: id,
          status: 'cancelled',
          changedBy: clientId,
        }).save();
        await this.UserModel.findByIdAndUpdate(
          clientId,
          { $pull: { orders: id } },
          { new: true }
        );
      }
      if (!deleted) {
        throw new HttpException({ message: 'Failed to cancel order' }, HttpStatus.NOT_FOUND);
      }
      return { message: 'Order cancelled successfully' };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to cancel order', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
