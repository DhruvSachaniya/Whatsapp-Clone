import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (cfg: ConfigService) => ({
                transport: {
                    host: cfg.get('MAIL_HOST'),
                    secure: false,
                    auth: {
                        user: cfg.get('SMTP_USERNAME'),
                        pass: cfg.get('SMTP_PASSWORD'),
                    },
                },
                defaults: {
                    from: `"Whatsapp-Clone" <${cfg.get('SMTP_USERNAME')}`,
                },
                template: {
                    dir: './src/Services/email/templates',
                    adapter: new EjsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailMoudle {}
