import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userservice: UserService) {}

    //TODO:1 For Group join there is only one way by sending invitation to perticular Mobile Number
    //Todo:2 search group by only those user has joined, upload user photo, update photo --> pending

    //Search By Global
    @UseGuards(JwtAuthGuard)
    @Get('details')
    async user_details(@Query('MobileNumber') MobileNumber: number) {
        return this.userservice.user_detail(MobileNumber);
    }

    //Search By UsersContacts
    @Get('Userdetails')
    user_Contacts_details(
        @Query('MobileNumber') MobileNumber: number,
        @Query('Name') Name: string,
    ) {
        return this.userservice.Search_in_User(MobileNumber, Name);
    }

    @UseGuards(JwtAuthGuard)
    @Get('group')
    async user_joined_group() {
        return;
    }
}
