import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateNameDto } from './dto/name.dto';
import { ForgetPasswordDto } from './dto/forgetpass.dto';
import { EmailService } from 'src/Services/email/email.service';
import * as moment from 'moment-timezone';
import { SecurityCode } from './entities/code.entity';
import { VarifyCodeDto } from './dto/varifycode.dto';
import * as crypto from 'crypto';
import { ChangePasswordDto } from './dto/changepass.dto';
import * as argon2 from 'argon2';
import * as Multer from 'multer';
import { stat } from 'fs';

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
            // Fetch the user and include their contacts
            const user = await this.userRepository.findOne({
                where: { MobileNumber },
                relations: ['chatcontacts'], // Include chatcontacts in the query
            });

            if (!user) {
                throw new HttpException(
                    'Mobile number not found!',
                    HttpStatus.NOT_FOUND,
                );
            }

            // Optionally remove the password from the response
            const { Password, ...userWithoutPassword } = user;

            return userWithoutPassword;
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
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
                    'Email Does not Exits!',
                    HttpStatus.NOT_FOUND,
                );
            }

            //CODE Functionality
            const code = crypto.randomBytes(4).toString('hex');
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

            return {
                message: 'Code has been sent to registered mail',
                status: HttpStatus.OK,
            };
        } catch (err) {
            console.log(err);
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

            const currentTimeIST = moment().tz('Asia/Kolkata');

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
                    return {
                        message: 'can change Password!',
                        status: HttpStatus.OK,
                    };
                } else {
                    throw new HttpException(
                        'User Is Not Validate',
                        HttpStatus.NOT_ACCEPTABLE,
                    );
                }
            } else {
                return {
                    message: 'Code has Expired!',
                    status: HttpStatus.NOT_ACCEPTABLE,
                };
            }
        } catch (err) {
            throw new HttpException(
                err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async Change_Password(dto: ChangePasswordDto) {
        //will require new password, confirm password, email
        try {
            const find_user = await this.userRepository.findOne({
                where: {
                    Email: dto.RegEmail,
                },
            });

            if (find_user && find_user.IsValidated) {
                //change process
                if (dto.newPass !== dto.confirmPass) {
                    throw new HttpException(
                        'Password Does not Match',
                        HttpStatus.NOT_ACCEPTABLE,
                    );
                }
                const hash = await argon2.hash(dto.newPass);

                find_user.Password = hash;
                await this.userRepository.save(find_user);

                return {
                    message: 'Password Changed Successfully!',
                    status: HttpStatus.OK,
                };
            } else {
                return {
                    message: 'user is not Varified!',
                    status: HttpStatus.NOT_ACCEPTABLE,
                };
            }
        } catch (err) {
            throw new HttpException(
                err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    //upload profile picture
    async uploadProfilePicture(user: any, url: any) {
        try {
            if (!url) {
                throw new HttpException(
                    'Error Uploading Profile Picture',
                    HttpStatus.NOT_FOUND,
                );
            }

            const find_user = await this.userRepository.findOne({
                where: { id: user.id },
            });

            if (!find_user) {
                throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
            }

            find_user.UserPhotoUrl = url;

            await this.userRepository.save(find_user);

            return {
                message: 'Profile Picture Uploaded Successfully',
                find_user,
            };
        } catch (err) {
            // Handle Multer-specific errors
            if (err instanceof Multer.MulterError) {
                throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
            }
            throw err; // Rethrow other errors
        }
    }

    //add User to contacts
    async addContact(userId: number, contactId: number): Promise<any> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['chatcontacts'],
            });

            const contact = await this.userRepository.findOne({
                where: { id: contactId },
                relations: ['chatcontacts'],
            });

            if (!user || !contact) {
                throw new HttpException(
                    'User or contact not found',
                    HttpStatus.NOT_FOUND,
                );
            }

            if (!user.chatcontacts.find((c) => c.id === contactId)) {
                user.chatcontacts.push(contact);
            }

            if (!contact.chatcontacts.find((c) => c.id === userId)) {
                contact.chatcontacts.push(user);
            }

            // Save the changes
            await this.userRepository.save(user);

            return {
                message: 'Contact added successfully',
                status: HttpStatus.OK,
            };
        } catch (err) {
            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
