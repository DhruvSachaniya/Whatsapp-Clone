import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { SocketGateway } from 'src/gateway/socket.gateway';

@Module({
    imports: [],
    controllers: [ChatController],
    providers: [ChatService, JwtStrategy, SocketGateway],
})
export class ChatModule {}
