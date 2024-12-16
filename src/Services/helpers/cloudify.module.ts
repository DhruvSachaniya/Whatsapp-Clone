import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudify.provider';
import { CloudinaryService } from './cloudify.service';

@Module({
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryService], // Export the service for use in other modules
})
export class CloudinaryModule {}
