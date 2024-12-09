import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { CyptoSecurity } from 'src/Services/security';
import { EmailService } from 'src/Services/email/email.service';
import { OtpVarifyDto } from './dto/otpvarify.dto';
import { Otp } from './entities/otp.entity';
import * as moment from 'moment-timezone';
@Injectable({})
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
        private jwt: JwtService,
        private crypto: CyptoSecurity,
        private emailService: EmailService,
    ) {}
    //TODO:- Update name, password, email, photo,
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
            //Validate Mobile Num
            const valid = this.isValid_Mobile_Number(
                dto.MobileNumber.toString(),
            );

            if (!valid) {
                throw new HttpException(
                    'Not Valid Number!',
                    HttpStatus.BAD_REQUEST,
                );
            }

            //Check if User Already Exits
            const already_user = await this.userRepository.find({
                where: [
                    { MobileNumber: dto.MobileNumber },
                    { Email: dto.Email },
                ],
            });

            if (already_user.length > 0) {
                throw new HttpException(
                    'User is Already Exists',
                    HttpStatus.CONFLICT,
                );
            }

            //otp section
            const otp = await this.geRandomOtp(999999);
            const currentTimeIST = moment().tz('Asia/Kolkata');
            const expireTimeIST = currentTimeIST.clone().add(2, 'minutes');

            const create_otp = new Otp({
                email: dto.Email,
                Otp: otp,
                createdat: currentTimeIST.format('YYYY-MM-DD HH:mm:ss'),
                expireat: expireTimeIST.format('YYYY-MM-DD HH:mm:ss'),
            });
            await this.otpRepository.save(create_otp);

            //Send OTP Email
            await this.emailService.sendUserEmail(dto, otp);

            //Hash Password and Save User
            const hash = await argon.hash(dto.Password);

            const date = new Date();
            const user = new User({
                MobileNumber: dto.MobileNumber,
                Password: hash,
                UserName: dto.UserName,
                Email: dto.Email,
                Created_At: date,
            });

            await this.userRepository.save(user);

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

    async VarifyOtp(dto: OtpVarifyDto) {
        try {
            const found_otp = await this.otpRepository.findOneBy({
                Otp: Number(dto.otp),
            });

            if (!found_otp) {
                throw new HttpException(
                    'Otp Not Found or Not Valid!',
                    HttpStatus.NOT_FOUND,
                );
            }

            const currentTimeIST = moment().tz('Asia/Kolkata');

            const expireTimeIST = moment.tz(found_otp.expireat, 'Asia/Kolkata');

            if (currentTimeIST.isBefore(expireTimeIST)) {
                // OTP is still valid
                const user = await this.userRepository.findOneBy({
                    Email: found_otp.email,
                });

                if (user) {
                    user.IsValidated = true; // Mark the user as validated
                    await this.userRepository.save(user);
                    return {
                        message:
                            'OTP verified successfully, user is now validated.',
                    };
                } else {
                    throw new HttpException(
                        'User not found!',
                        HttpStatus.NOT_FOUND,
                    );
                }
            } else {
                throw new HttpException(
                    'OTP has expired',
                    HttpStatus.BAD_REQUEST,
                );
            }
        } catch (err) {
            throw new HttpException(
                err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
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
