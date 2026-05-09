
import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { servicesService } from './services.service';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('services')
export class servicesController {

    constructor(private readonly servicesService: servicesService) { }
    @Get()
    findAll() {
        return this.servicesService.findAllservices();
    }
    @Get(':id')
    findById(@Param('id') id: string) {
        return this.servicesService.findByIdservices(id);
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {

        const serviceData = {
            ...body,
            image: file ? file.filename : null,
        };

        return this.servicesService.createservices(serviceData);
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
