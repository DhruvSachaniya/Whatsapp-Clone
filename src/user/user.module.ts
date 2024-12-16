import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Chat } from 'src/Chat/entities/chat.entity';
import { Group } from 'src/group/entities/group.entity';
import { EmailMoudle } from 'src/Services/email/email.module';
import { SecurityCode } from './entities/code.entity';
import { CloudinaryService } from 'src/Services/helpers/cloudify.service';
import { CloudinaryProvider } from 'src/Services/helpers/cloudify.provider';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Chat, Group, SecurityCode]),
        EmailMoudle,
    ],
    controllers: [UserController],
    providers: [UserService, CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryService],
})
export class UserModule {}
