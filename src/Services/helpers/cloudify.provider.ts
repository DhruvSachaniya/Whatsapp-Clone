import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from './constants';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
    provide: CLOUDINARY,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        return cloudinary.config({
            cloud_name: configService.getOrThrow('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.getOrThrow('CLOUDINARY_API_KEY'),
            api_secret: configService.getOrThrow('CLOUDINARY_API_SECRET'),
        });
    },
};
