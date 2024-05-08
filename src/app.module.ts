import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './Chat/chat.module';
import { SocketGateway } from './gateway/socket.gateway';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        AuthModule,
        ChatModule,
    ],
    controllers: [],
    providers: [SocketGateway],
})
export class AppModule {}
