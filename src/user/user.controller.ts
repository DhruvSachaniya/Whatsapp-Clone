import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userservice: UserService) {}

    //Todo:1 search group by only those user has joined, upload user photo, update photo --> pending

    @UseGuards(JwtAuthGuard)
    @Get('details')
    async user_details(@Query('MobileNumber') MobileNumber: number) {
        return this.userservice.user_detail(MobileNumber);
    }

    @UseGuards(JwtAuthGuard)
    @Get('group')
    async user_joined_group() {
        return;
    }
}
