import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guard/local.guard';
import { OtpVarifyDto } from './dto/otpvarify.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authservice: AuthService) {}

    @Post('user/signup')
    async SignUp(@Body() dto: SignUpDto) {
        return this.authservice.SignUp(dto);
    }

    @Post('varify')
    async VarifyOtp(@Body() dto: OtpVarifyDto) {
        return this.authservice.VarifyOtp(dto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('user')
    async SignIn(@Request() req) {
        return this.authservice.SignIn(req.user);
    }
}
