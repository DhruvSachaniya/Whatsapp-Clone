import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LocalStrategy } from './strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { Chat } from 'src/Chat/entities/chat.entity';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalAuthGuard } from './guard/local.guard';
import { Group } from 'src/group/entities/group.entity';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'THEREISNOSECRET',
            signOptions: { expiresIn: '1h' },
        }),
        TypeOrmModule.forFeature([User, Chat, Group]),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy, LocalAuthGuard],
})
export class AuthModule {}
