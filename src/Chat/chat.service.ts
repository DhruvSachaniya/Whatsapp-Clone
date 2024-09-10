import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatCreateDto } from './dto/chat-create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { ChatMeassageDto } from './dto/chat-meassage.dto';
import { ChatMeassage } from './entities/chat-meassage.entity';
import { ChatDeleteDto } from './dto/chat-delete.dto';
import { CyptoSecurity } from 'src/Services/security';
import { User } from 'src/auth/entities/user.entity';

@Injectable({})
export class ChatService {
    constructor(
        @InjectRepository(Chat)
        private readonly ChatRepository: Repository<Chat>,
        @InjectRepository(ChatMeassage)
        private readonly ChatMeassageRepo: Repository<ChatMeassage>,
        @InjectRepository(User)
        private readonly UserRepo: Repository<User>,
        private cryptotech: CyptoSecurity,
    ) {}

    async createchat(user: any, dto: ChatCreateDto) {
        try {
            //create first one to one chat
            const find_chat = await this.ChatRepository.find({
                where: {
                    user_1: Number(dto.user1) as null,
                },
                relations: {
                    user_1: true,
                    user_2: true,
                },
            });

            if (find_chat) {
                find_chat.forEach((object) => {
                    if (object.user_2.id === Number(dto.user2)) {
                        throw new HttpException(
                            'chat is already created!',
                            HttpStatus.OK,
                        );
                    }
                });
            }

            const create_chat = new Chat({
                user_1: user.id,
                user_2: Number(dto.user2) as null,
            });

            return {
                create_chat,
            };
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async post_chat_meassage(user: any, dto: ChatMeassageDto) {
        try {
            //fetch receiver by dto
            const receiver = await this.UserRepo.findOne({
                where: {
                    id: Number(dto.reciverid),
                },
            });

            if (!receiver) {
                throw new HttpException(
                    'Receiver not found',
                    HttpStatus.NOT_FOUND,
                );
            }
            const find_chat = await this.ChatRepository.findOne({
                where: {
                    user_1: { id: user.id },
                    user_2: { id: Number(dto.reciverid) },
                },
            });

            const date = new Date();

            //encrypt the meassage
            const encrypt_chat = await this.cryptotech.encrypt(dto.meassage);

            if (!find_chat) {
                const Create_new_chat = new Chat({
                    user_1: user.id,
                    user_2: receiver,
                    meassages: [],
                });

                if (!Create_new_chat) {
                    throw new HttpException(
                        'Error To Create New Chat',
                        HttpStatus.FORBIDDEN,
                    );
                }

                await this.ChatRepository.save(Create_new_chat);

                const creat_chat_message = new ChatMeassage({
                    ownerId: user.id,
                    receiverId: receiver,
                    meassage: encrypt_chat,
                    ChatId: Create_new_chat,
                    Created_At: date,
                });

                await this.ChatMeassageRepo.save(creat_chat_message);

                Create_new_chat.meassages.push(Number(creat_chat_message.id));

                await this.ChatRepository.save(Create_new_chat);

                return {
                    Create_new_chat,
                    creat_chat_message,
                };
            }

            const create_chat_meassage = new ChatMeassage({
                ownerId: user.id,
                receiverId: Number(dto.reciverid) as null,
                meassage: encrypt_chat,
                ChatId: find_chat,
                Created_At: date,
            });

            if (!create_chat_meassage) {
                throw new HttpException(
                    'error to meassage in chat!',
                    HttpStatus.FAILED_DEPENDENCY,
                );
            }

            await this.ChatMeassageRepo.save(create_chat_meassage);

            find_chat[0].meassages.push(Number(create_chat_meassage.id));

            await this.ChatRepository.save(find_chat);

            return {
                find_chat,
                create_chat_meassage,
            };
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async get_chat_meassages(user: any, receiverId: number) {
        try {
            //will require owner and receiver id's

            const find_chat_meassage = await this.ChatMeassageRepo.find({
                where: [
                    { ownerId: user.id },
                    { receiverId: Number(receiverId) as null },
                ],
                relations: {
                    ChatId: true,
                },
            });

            return {
                find_chat_meassage,
            };
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete_chat_meassages(user: any, dto: ChatDeleteDto) {
        try {
            //will require meassage id, chat id
            const delete_meassage = await this.ChatRepository.find({
                where: [
                    { user_1: user.id },
                    { user_2: Number(dto.receiverid) as null },
                ],
            });

            const index = delete_meassage[0].meassages.indexOf(
                Number(dto.meassageid),
            );

            delete_meassage[0].meassages.slice(index, 1);

            await this.ChatRepository.save(delete_meassage);

            return {
                delete_meassage,
            };
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
