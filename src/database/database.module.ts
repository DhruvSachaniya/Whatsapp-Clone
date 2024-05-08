import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configservice: ConfigService) => ({
                type: 'postgres',
                host: configservice.getOrThrow('DATABASE_HOST'),
                port: configservice.getOrThrow('DATABASE_PORT'),
                database: configservice.getOrThrow('DATABASE'),
                username: configservice.getOrThrow('DATABASE_USERNAME'),
                password: configservice.getOrThrow('DATABASE_PASSWORD'),
                autoLoadEntities: true,
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}
