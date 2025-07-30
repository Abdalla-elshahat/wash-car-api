// clients/clients.controller.ts
import { Controller, Post, Body, Get, Param, Patch, Delete, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }
    @Get()
    findAll(@Query('page') page: number, @Query('limit') limit: number) {
        return this.clientsService.findAll(
            page && !isNaN(page) ? Number(page) : 1,
            limit && !isNaN(limit) ? Number(limit) : 10,
        );
    }
    
    @Get(':id')
    findById(@Param('id') id: string) {
        return this.clientsService.findById(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.clientsService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.clientsService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clientsService.delete(id);
    }
}
