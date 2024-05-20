import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as argon from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
            usernameField: 'MobileNumber',
            passwordField: 'Password',
        });
    }

    async validate(MobileNumber: number, Password: string): Promise<any> {
        console.log('validate fun');
        // if mobielnumber exites
        const user = await this.userRepository.findOne({
            where: {
                MobileNumber: MobileNumber,
            },
        });

        if (!user) {
            throw new HttpException('not found!', HttpStatus.NOT_FOUND);
        }

        // cheeck password with hash
        const hashed = await argon.verify(user.Password, Password);

        // if get right then return user
        if (hashed) {
            return user;
        } else {
            throw new HttpException('Wrong Password!', HttpStatus.UNAUTHORIZED);
        }
    }
}
