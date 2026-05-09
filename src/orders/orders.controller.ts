
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { orderService } from './orders.service';

@Controller('orders')
export class OrdersController {

    constructor(private readonly ordersService: orderService) { }
    @Get()
    async findAll(@Query() query: any) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filters = {
            status: query.status,
            paymentMethod: query.paymentMethod,
            clientId: query.clientId,
            serviceId: query.serviceId,
            cartype: query.cartype,
        };

        const [orders, total] = await this.ordersService.findOrdersByFilters(filters, skip, limit);

        return {
            data: orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.ordersService.findorderById(id);
    }

    @Get('orderstoday')
    findordertoday() {
        return this.ordersService.findordertoday();
    }

    @Post()
    create(@Body() body: any) {
        return this.ordersService.createorder(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.ordersService.updateorder(id, body
        );
    }

    @Patch('status/:id')
    updatestatus(@Param('id') id: string, @Body() body: any) {
        return this.ordersService.updateorderstatus(id, body
        );
    }

    @Delete(':id/client/:clientId')
    remove(@Param('id') id: string, @Param() clientId: string) {
        return this.ordersService.deleteorder(id, clientId);
    }
}
