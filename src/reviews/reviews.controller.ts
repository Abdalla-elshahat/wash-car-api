import { Controller, Get, Post, Body, Param, Delete, Query, Req, Patch } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.reviewsService.create(body, req.user);
  }

  @Get()
  findAll(@Query('laundryId') laundryId?: string) {
    return this.reviewsService.findAll(laundryId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.reviewsService.update(id, body, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.reviewsService.remove(id, req.user);
  }
}
