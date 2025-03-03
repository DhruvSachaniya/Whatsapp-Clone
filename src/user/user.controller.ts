import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Query,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { UpdateNameDto } from './dto/name.dto';
import { ForgetPasswordDto } from './dto/forgetpass.dto';
import { VarifyCodeDto } from './dto/varifycode.dto';
import { ChangePasswordDto } from './dto/changepass.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/Services/helpers/cloudify.service';
import { AddContactDto } from './dto/addcontacts.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly userservice: UserService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    //Get LoggedIn User
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req) {
        return this.userservice.GetMeDetils(req.user);
    }

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

    //add User to contacts
    @UseGuards(JwtAuthGuard)
    @Post('addcontact')
    async Add_Contact(@Body() dto: AddContactDto) {
        return this.userservice.addContact(dto.userId, dto.contactId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('name')
    async Update_user_Name(@Request() req, @Body() dto: UpdateNameDto) {
        return this.userservice.update_user_name(req.user, dto);
    }

    @Post('password')
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

    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 1024 * 1024 * 3 },
            fileFilter: (req, file, callback) => {
                //Allow only images files
                // if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                //     return callback(
                //         new BadRequestException('Invalid file'),
                //         false,
                //     );
                // }
                callback(null, true);
            },
        }),
    ) // Expecting 'file' in form-data
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ) {
        // Call uploadImage method
        const result = await this.cloudinaryService.uploadImage(file);

        return this.userservice.uploadProfilePicture(req.user, result.url);
    }
}
