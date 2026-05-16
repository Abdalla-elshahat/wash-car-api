import { Controller, Post, Body, Get, Param, Patch, Delete, Query, UseInterceptors, UploadedFile, Headers, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { deleteOldImage } from 'src/helpers/helper';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    getAllUsers(
        @Query('page') page: number,
        @Query('limit') limit: number) {

        return this.usersService.getAllUsers(
            page && !isNaN(page) ? Number(page) : 1,
            limit && !isNaN(limit) ? Number(limit) : 10,
        );
    }

    @Get('me')
    getProfile(@Req() req: any) {
        const userId = (req as any).user.id;
        return this.usersService.findById(userId);
    }

    @Patch()
    @UseInterceptors(FileInterceptor('profileImage'))
    async updateProfile(
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        const userId = (req as any).user.id;
        try {
            const updateData = {
                ...body,
                ...(file && { profileImage: file.filename }),
            };
            return await this.usersService.updateProfile(updateData, userId);
        } catch (error) {
            if (file?.filename) {
                deleteOldImage('users', file.filename);
            }
            throw error;
        }
    }

    @Patch('return')
    returnUserbyAdmin(@Body() body: any) {
        return this.usersService.returnUserbyAdmin(body.userId);
    }

    @Delete()
    softDeleteUser(@Req() req: any) {
        const userId = (req as any).user.id;
        return this.usersService.softDeleteUser(userId);
    }
}
