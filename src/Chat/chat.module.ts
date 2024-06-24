import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { SocketGateway } from 'src/gateway/socket.gateway';
import { User } from 'src/auth/entities/user.entity';
import { Group } from 'src/group/entities/group.entity';
import { GroupMessage } from 'src/group/entities/group-chat.entity';
import { Chat } from './entities/chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMeassage } from './entities/chat-meassage.entity';
import { CyptoSecurity } from 'src/Services/security';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Chat,
            Group,
            GroupMessage,
            ChatMeassage,
        ]),
    ],
    controllers: [ChatController],
    providers: [ChatService, JwtStrategy, SocketGateway, CyptoSecurity],
})
export class ChatModule {}
