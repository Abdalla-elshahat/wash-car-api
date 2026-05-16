import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LaundriesService } from './laundries.service';
import { deleteOldImage } from '../helpers/helper';

@Controller('laundries')
export class LaundriesController {
  constructor(private readonly laundriesService: LaundriesService) { }

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      const laundryData = {
        ...body,
        logo: file ? file.filename : null,
        ownerId: req.user.id,
      };
      return await this.laundriesService.create(laundryData);
    } catch (error) {
      if (file?.filename) {
        deleteOldImage('laundries', file.filename);
      }
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.laundriesService.findAll();
  }

  @Patch('status/:id')
  changeStatusLaundrybyAdmin(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.laundriesService.changeStatusLaundrybyAdmin(id, body);
  }

  @Get('owner')
  findByOwnerId(@Req() req: any) {
    return this.laundriesService.findByOwnerId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laundriesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      const updateData = {
        ...body,
        ...(file && { logo: file.filename }),
      };
      return await this.laundriesService.update(id, updateData, req.user);
    } catch (error) {
      if (file?.filename) {
        deleteOldImage('laundries', file.filename);
      }
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.laundriesService.remove(id, req.user);
  }
}
