
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { orderService } from './orders.service';

@Controller('orders')
export class OrdersController {

    constructor(private readonly ordersService:orderService) { }
    @Get()
    findAll() {
        return this.ordersService.findAllorder();
    }


    @Get(':id')
    findById(@Param('id') id: string) {
        return this.ordersService.findByIdorder(id);
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

    
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ordersService.deleteorder(id);
    }
 }
