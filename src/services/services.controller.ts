import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { servicesService } from './services.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { deleteOldImage } from 'src/helpers/helper';

@Controller('services')
export class servicesController {

    constructor(private readonly servicesService: servicesService) { }
    @Get(":laundryId")
    findAll(@Param('laundryId') laundryId: string) {
        return this.servicesService.findAllservices(laundryId);
    }


    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Req() req: Request,
    ) {
        const userId = (req as any).user.id;
        const serviceData = {
            ...body,
            image: file ? file.filename : null,
            ownerId: userId,
        };

        return this.servicesService.createservices(serviceData);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Req() req: Request
    ) {

        const userId = (req as any).user.id;

        try {

            const updateData = {
                ...body,
                ...(file && { image: file.filename }),
            };

            return await this.servicesService.updateservices(
                id,
                updateData,
                userId,
            );

        } catch (error) {

            // امسح الصورة الجديدة لو العملية فشلت
            if (file?.filename) {
                deleteOldImage('services', file.filename);
            }

            throw error;
        }
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: Request) {
        const userId = (req as any).user.id;
        return this.servicesService.deleteservices(id, userId);
    }
}
