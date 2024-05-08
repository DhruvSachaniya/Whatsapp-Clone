import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guard/local.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authservice: AuthService) {}

    @Get('user')
    async SignUp(@Body() dto: SignUpDto) {
        return this.authservice.SignUp(dto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('user')
    async SignIn(@Request() req) {
        return this.authservice.SignIn(req.user);
    }
}
