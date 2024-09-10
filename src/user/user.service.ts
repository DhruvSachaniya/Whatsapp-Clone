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

    //Search In User Details
    async Search_in_User(MobileNumber: number, Name: string) {
        try {
            const search_by_num = await this.userRepository.find({
                where: {
                    MobileNumber,
                },
            });

            const search_by_name = await this.userRepository.find({
                where: {
                    UserName: Name,
                },
            });

            if (search_by_name.length < 0 && search_by_num.length < 0) {
                throw new HttpException('No User Found', HttpStatus.NOT_FOUND);
            }

            return {
                search_by_num,
                search_by_name,
            };
        } catch (err) {
            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
