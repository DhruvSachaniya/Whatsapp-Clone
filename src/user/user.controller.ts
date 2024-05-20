import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userservice: UserService) {}

    //Todo:1 search group by only those user has joined,

    @Get('details')
    async user_details(@Query('MobileNumber') MobileNumber: number) {
        return this.userservice.user_detail(MobileNumber);
    }
}
