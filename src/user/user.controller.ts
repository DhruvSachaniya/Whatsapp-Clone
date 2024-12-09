import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { UpdateNameDto } from './dto/name.dto';
import { ForgetPasswordDto } from './dto/forgetpass.dto';
import { VarifyCodeDto } from './dto/varifycode.dto';
import { ChangePasswordDto } from './dto/changepass.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userservice: UserService) {}

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
    @Patch('name')
    async Update_user_Name(@Request() req, @Body() dto: UpdateNameDto) {
        return this.userservice.update_user_name(req.user, dto);
    }

    @Get('password')
    async Forget_password(@Body() dto: ForgetPasswordDto) {
        return this.userservice.Forget_Password(dto);
    }

    @Post('varify')
    async Varify_SecurityCode(@Body() dto: VarifyCodeDto) {
        return this.userservice.Varify_Code(dto);
    }

    @Post('changepassword')
    async Change_Password(@Body() dto: ChangePasswordDto) {
        return this.userservice.Change_Password(dto);
    }
}
