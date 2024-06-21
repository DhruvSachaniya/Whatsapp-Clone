import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { CyptoSecurity } from 'src/Services/security';
@Injectable({})
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwt: JwtService,
        private crypto: CyptoSecurity,
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
        // signup using mobile number and username
        // encrypt password using argon
        //TODO:- add recovery code to verified for long time when generate otp
        //TODO --> encryption, decryption
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
            const usernameencrypt = await this.crypto.encrypt(dto.UserName);
            console.log('encrypted', usernameencrypt);

            const already_user = await this.userRepository.findOneBy({
                MobileNumber: dto.MobileNumber,
            });

            if (already_user) {
                throw new HttpException(
                    'Mobile Number Already Exists',
                    HttpStatus.CONFLICT,
                );
            }

            const hash = await argon.hash(dto.Password);

            const date = await new Date();
            const user = new User({
                MobileNumber: dto.MobileNumber,
                Password: hash,
                UserName: dto.UserName,
                Created_At: date,
            });

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
}
