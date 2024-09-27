import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Chat } from 'src/Chat/entities/chat.entity';
import { Group } from 'src/group/entities/group.entity';
import { EmailMoudle } from 'src/Services/email/email.module';
import { SecurityCode } from './entities/code.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Chat, Group, SecurityCode]),
        EmailMoudle,
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
