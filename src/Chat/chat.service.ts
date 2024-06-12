import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatCreateDto } from './dto/chat-create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';

@Injectable({})
export class ChatService {
    constructor(
        @InjectRepository(Chat)
        private readonly ChatRepository: Repository<Chat>,
    ) {}

    async createchat(user: any, dto: ChatCreateDto) {
        try {
            //create first one to one chat
            const create_chat = await this.ChatRepository.find({
                where: {
                    user_1: user.id,
                },
            });

            if (create_chat) {
                if (Number(create_chat) === Number(dto.reciverid)) {
                    throw new HttpException(
                        'user is already created',
                        HttpStatus.FOUND,
                    );
                }
            }
            //this will create on first time when user search the reciver
            return {
                user,
                dto,
            };
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //show chat meassages, post chat, delete chat,
}
