import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SignUpDto } from 'src/auth/dto/signup.dto';

@Injectable()
export class EmailService {
    constructor(private mailerService: MailerService) {}

    async sendUserEmail(dto: SignUpDto, otp: number) {
        const name = dto.UserName;

        try {
            await this.mailerService.sendMail({
                to: dto.Email,
                subject: 'Welcome to Dhruv App!',
                text: 'welcome',
                html: `
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>OTP Email</title>
                </head>
                <body>
                    <p>Hello ${name},</p>
                    <p>Your OTP is: ${otp}</p>
                </body>`,
            });
        } catch (error) {
            console.log(error, 'from email service!');
        }
    }

    async SendSecuritycode(dto: SignUpDto, code: string) {
        const Name = dto.UserName;

        try {
            await this.mailerService.sendMail({
                to: dto.Email,
                subject: 'From Dhruv App!',
                text: 'Security Code',
                html: `
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Changing Password Request</title>
                </head>
                <body>
                    <p>Hello ${Name},</p>
                    <p>Your Security Code is: ${code}</p>
                </body>`,
            });
        } catch (err) {
            console.log(err, 'Error from Email SendCode!');
        }
    }
}
