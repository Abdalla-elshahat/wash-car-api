
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { servicesService } from './services.service';

@Controller('services')
export class servicesController {

    constructor(private readonly servicesService:servicesService) { }
    @Get()
    findAll() {
        return this.servicesService.findAllservices();
    }
    @Get(':id')
    findById(@Param('id') id: string) {
        return this.servicesService.findByIdservices(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.servicesService.createservices(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.servicesService.updateservices(id, body
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.servicesService.deleteservices(id);
    }
 }
