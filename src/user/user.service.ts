import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateNameDto } from './dto/name.dto';
import { ForgetPasswordDto } from './dto/forgetpass.dto';
import { EmailService } from 'src/Services/email/email.service';
import moment from 'moment-timezone';
import { SecurityCode } from './entities/code.entity';
import { VarifyCodeDto } from './dto/varifycode.dto';

@Injectable({})
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(SecurityCode)
        private codeRepository: Repository<SecurityCode>,
        private emailService: EmailService,
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

    async update_user_name(user: any, dto: UpdateNameDto) {
        try {
            //first find user
            const find_user = await this.userRepository.findOne({
                where: {
                    id: user.id,
                },
            });

            if (!find_user) {
                throw new HttpException(
                    'Did Not Find User',
                    HttpStatus.NOT_FOUND,
                );
            }

            find_user.UserName = dto.NewUsername;

            await this.userRepository.save(find_user);

            return {
                message: 'Name has been updated!',
                find_user,
            };
        } catch (err) {
            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async Forget_Password(dto: ForgetPasswordDto) {
        try {
            const find_user_emaail = await this.userRepository.findOne({
                where: {
                    Email: dto.RegEmail,
                },
            });

            if (!find_user_emaail || !find_user_emaail.IsValidated) {
                throw new HttpException(
                    'Error In the Email!',
                    HttpStatus.NOT_FOUND,
                );
            }

            //CODE Functionality
            const code = Math.random().toString(36).substring(2, 10);
            const currentTimeIST = moment().tz('Asia/Kolkata');
            const expireTimeIST = currentTimeIST.clone().add(5, 'minutes');

            const create_code = new SecurityCode({
                email: dto.RegEmail,
                code: code,
                createdat: currentTimeIST.format('YYYY-MM-DD HH:mm:ss'),
                expireat: expireTimeIST.format('YYYY-MM-DD HH:mm:ss'),
            });

            await this.codeRepository.save(create_code);
            //email Functionality
            await this.emailService.SendSecuritycode(find_user_emaail, code);

            throw new HttpException(
                'Code Has Sent To Registerd Mail!',
                HttpStatus.CREATED,
            );
        } catch (err) {
            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async Varify_Code(dto: VarifyCodeDto) {
        try {
            const found_code = await this.codeRepository.findOne({
                where: {
                    code: dto.code,
                },
            });

            if (!found_code) {
                throw new HttpException(
                    'Code Not Found or Not Valid!',
                    HttpStatus.NOT_FOUND,
                );
            }

            const currentTimeIST = moment.tz('Asia/Kolkata');

            const expireTimeIST = moment.tz(
                found_code.expireat,
                'Asia/Kolkata',
            );

            if (currentTimeIST.isBefore(expireTimeIST)) {
                // Code is Still Valid
                const user = await this.userRepository.findOne({
                    where: {
                        Email: dto.RegEmail,
                    },
                });

                if (user && user.IsValidated) {
                    throw new HttpException(
                        'Can Change Password',
                        HttpStatus.ACCEPTED,
                    );
                } else {
                    throw new HttpException(
                        'User Is Not Validate',
                        HttpStatus.NOT_ACCEPTABLE,
                    );
                }
            } else {
                throw new HttpException(
                    'Code Has Expired!',
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

    async Change_Password() {}
}
