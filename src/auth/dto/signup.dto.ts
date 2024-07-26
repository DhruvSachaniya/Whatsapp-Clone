import { IsEmail } from 'class-validator';

export class SignUpDto {
    MobileNumber: number;
    UserName: string;

    @IsEmail()
    Email: string;
    Password: string;
}
