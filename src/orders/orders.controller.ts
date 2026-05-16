import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { orderService } from './orders.service';

@Controller('orders')
export class OrdersController {

    constructor(private readonly ordersService: orderService) { }
    @Get("laundry/:laundryId")
    async getOrdersbyownerId(@Param('laundryId') laundryId: string, @Query() query: any, @Req() req: any) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filters = {
            status: query.status,
            paymentMethod: query.paymentMethod,
            clientId: query.clientId,
            serviceId: query.serviceId,
            cartype: query.cartype,
            date: query.date,
        };

        const [orders, total] = await this.ordersService.getOrdersbyownerId(laundryId, filters, skip, limit, req.user.id);

        return {
            data: orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }

    @Get('client')
    async findByClient(@Query() query: any, @Req() req: any) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await this.ordersService.getOrdersByClient(req.user.id, skip, limit);

        return {
            data: orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }

    @Post()
    create(@Body() body: any, @Req() req: any) {
        return this.ordersService.createorder(body, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const clientId = req.user.id;
        return this.ordersService.updateorder(id, body, clientId);
    }

    @Patch('status/:id')
    updatestatus(@Param('id') id: string, @Body() body: any, @Req() req: any) {
        const ownerId = req.user?.id;
        return this.ordersService.updateorderstatus(id, body, ownerId);
    }

    @Delete(':id')
    cancelorder(@Param('id') id: string, @Req() req: any) {
        const clientId = req.user.id;
        return this.ordersService.cancelorder(id, clientId);
    }
}
