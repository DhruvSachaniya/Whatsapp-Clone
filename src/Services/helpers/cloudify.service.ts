import { Injectable } from '@nestjs/common';
import {
    v2 as cloudinary,
    UploadApiResponse,
    UploadApiErrorResponse,
} from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
    async uploadImage(
        file: Express.Multer.File,
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        console.log('Starting upload to Cloudinary...');
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: 'uploads' }, // You can specify options like folder name here
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Error:', error);
                        return reject(error);
                    }
                    console.log('Cloudinary Upload Successful:', result);
                    resolve(result);
                },
            );

            console.log('Piping file buffer to Cloudinary upload stream...');
            toStream(file.buffer).pipe(upload);
        });
    }
}
