import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { CyptoSecurity } from 'src/Services/security';
import { EmailService } from 'src/Services/email/email.service';
@Injectable({})
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwt: JwtService,
        private crypto: CyptoSecurity,
        private emailService: EmailService,
    ) {}

    SignIn(user: any) {
        // signin by mobile number
        // decrept password
        return {
            username: user.Username,
            token: this.jwt.sign({ sub: user.id, number: user.MobileNumber }),
        };
    }

    async SignUp(dto: SignUpDto) {
        //TODO:- add recovery code to verified for long time when generate otp

        try {
            const valid = this.isValid_Mobile_Number(
                dto.MobileNumber.toString(),
            );

            if ((await valid) == false) {
                throw new HttpException(
                    'Not Valid Number!',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const already_user = await this.userRepository.findOneBy({
                MobileNumber: dto.MobileNumber,
            });

            if (already_user) {
                throw new HttpException(
                    'Mobile Number Already Exists',
                    HttpStatus.CONFLICT,
                );
            }
            //otp section
            const otp = await this.geRandomOtp(999999);

            await this.emailService.sendUserEmail(dto, otp);

            const hash = await argon.hash(dto.Password);

            const date = new Date();
            const user = new User({
                MobileNumber: dto.MobileNumber,
                Password: hash,
                UserName: dto.UserName,
                Email: dto.Email,
                Created_At: date,
            });

            //until otp doesn't get equal to genrated otp dont save user

            // await this.userRepository.save(user);

            if (user) {
                throw new HttpException(
                    'created succesfully!',
                    HttpStatus.CREATED,
                );
            }
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async isValid_Mobile_Number(mobile_number: string) {
        const regex = new RegExp(/(0|91)?[6-9][0-9]{9}/);

        if (mobile_number == null) {
            return false;
        }

        if (regex.test(mobile_number) == true) {
            return true;
        } else {
            return false;
        }
    }

    async geRandomOtp(max: number) {
        return Math.floor(Math.random() * max);
    }
}
