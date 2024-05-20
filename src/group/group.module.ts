import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Chat } from 'src/Chat/entities/chat.entity';
import { Group } from './entities/group.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Chat, Group])],
    controllers: [GroupController],
    providers: [GroupService, JwtStrategy],
})
export class GroupMoudle {}
