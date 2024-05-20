import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Chat } from 'src/Chat/entities/chat.entity';
import { Group } from 'src/group/entities/group.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Chat, Group])],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
