import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable({})
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async user_detail(MobileNumber: number) {
        try {
            const user = await this.userRepository.findOne({
                where: { MobileNumber },
            });

            if (!user) {
                throw new HttpException(
                    'mobile number not  found!',
                    HttpStatus.NOT_FOUND,
                );
            }

            return user;
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
