import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwt: JwtService,
    ) {}

    SignIn(user: any) {
        // signin by mobile number
        // decrept password
        return {
            username: user.username,
            token: this.jwt.sign({
                id: user.id,
                MobileNumber: user.MobileNumber,
            }),
        };
    }

    async SignUp(dto: SignUpDto) {
        // signup using mobile number and username
        // encrypt password using argon
        try {
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

            const user = new User({
                MobileNumber: dto.MobileNumber,
                Password: hash,
                UserName: dto.UserName,
            });

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
}
