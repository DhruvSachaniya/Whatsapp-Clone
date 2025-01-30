import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './Chat/chat.module';
import { SocketGateway } from './gateway/socket.gateway';
import { UserModule } from './user/user.module';
import { GroupMoudle } from './group/group.module';
import { EmailMoudle } from './Services/email/email.module';
import { CloudinaryModule } from './Services/helpers/cloudify.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        AuthModule,
        ChatModule,
        UserModule,
        GroupMoudle,
        EmailMoudle,
        CloudinaryModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
