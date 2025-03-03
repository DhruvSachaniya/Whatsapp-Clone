import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
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
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
        private jwt: JwtService,
        private crypto: CyptoSecurity,
        private emailService: EmailService,
    ) {}

    SignIn(user: any) {
        return {
            // username: user.Username,
            user,
            token: this.jwt.sign({ sub: user.id }),
        };
    }

    async SignUp(dto: SignUpDto) {
        try {
            if (!this.isValid_Mobile_Number(dto.MobileNumber.toString())) {
                throw new HttpException(
                    'Invalid Mobile Number!',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const existingUsers = await this.userRepository.find({
                where: [
                    { MobileNumber: dto.MobileNumber },
                    { Email: dto.Email },
                ],
            });

            if (existingUsers.length > 0) {
                const existingUser = existingUsers[0];

                if (existingUser.IsValidated === false) {
                    //TODO:- also update the user values but only name and password
                    //update Username and Password
                    existingUser.UserName = dto.UserName;
                    existingUser.Password = await argon.hash(dto.Password);

                    await this.userRepository.save(existingUser);

                    //clear old otp
                    await this.otpRepository.delete({ email: dto.Email });
                    const otp = await this.generateOtp(dto.Email);

                    await this.emailService.sendUserEmail(dto, otp.Otp);
                    return {
                        message:
                            'User details updated. OTP sent again. Please verify your account!',
                        status: HttpStatus.CREATED,
                    };
                }

                throw new HttpException(
                    'User already exists!',
                    HttpStatus.CONFLICT,
                );
            }

            const otp = await this.generateOtp(dto.Email);
            await this.emailService.sendUserEmail(dto, otp.Otp);

            const hashedPassword = await argon.hash(dto.Password);
            const user = new User({
                MobileNumber: dto.MobileNumber,
                Password: hashedPassword,
                UserName: dto.UserName,
                Email: dto.Email,
                Created_At: new Date(),
            });

            await this.userRepository.save(user);
            return {
                message: 'User created successfully!',
                status: HttpStatus.CREATED,
            };
        } catch (error) {
            this.logger.error('Error during SignUp:', error.message);
            throw new HttpException(
                'An error occurred. Please try again later.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async VarifyOtp(dto: OtpVarifyDto) {
        try {
            const otp = await this.otpRepository.findOneBy({
                Otp: Number(dto.otp),
            });
            if (!otp)
                throw new HttpException(
                    'OTP not found or invalid!',
                    HttpStatus.NOT_FOUND,
                );

            const isExpired = moment()
                .tz('Asia/Kolkata')
                .isAfter(moment.tz(otp.expireat, 'Asia/Kolkata'));
            if (isExpired)
                throw new HttpException(
                    'OTP has expired',
                    HttpStatus.BAD_REQUEST,
                );

            const user = await this.userRepository.findOneBy({
                Email: otp.email,
            });
            if (!user)
                throw new HttpException(
                    'User not found!',
                    HttpStatus.NOT_FOUND,
                );

            user.IsValidated = true;
            await this.userRepository.save(user);

            return {
                message: 'OTP verified successfully!',
                status: HttpStatus.CREATED,
            };
        } catch (err) {
            this.logger.error('Error during OTP verification:', err.message);
            throw new HttpException(
                err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async generateOtp(email: string): Promise<Otp> {
        const otp = await this.geRandomOtp(999999);
        const currentTimeIST = moment().tz('Asia/Kolkata');
        const expireTimeIST = currentTimeIST.clone().add(2, 'minutes');

        const newOtp = new Otp({
            email,
            Otp: otp,
            createdat: currentTimeIST.format('YYYY-MM-DD HH:mm:ss'),
            expireat: expireTimeIST.format('YYYY-MM-DD HH:mm:ss'),
        });

        await this.otpRepository.save(newOtp);
        return newOtp;
    }

    isValid_Mobile_Number(mobile_number: string): boolean {
        const regex = /(0|91)?[6-9][0-9]{9}/;
        return regex.test(mobile_number);
    }

    async geRandomOtp(max: number): Promise<number> {
        return Math.floor(Math.random() * max);
    }
}
