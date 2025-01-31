import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { ChatMeassageDto } from './dto/chat-meassage.dto';
import { ChatMeassage } from './entities/chat-meassage.entity';
import { ChatDeleteDto } from './dto/chat-delete.dto';
import { CyptoSecurity } from 'src/Services/security';
import { User } from 'src/auth/entities/user.entity';
import { SocketGateway } from 'src/gateway/socket.gateway';

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
        private readonly socketGateway: SocketGateway,
    ) {}
    //TODO:- Update the chat Message
    async post_chat_meassage(user: any, dto: ChatMeassageDto): Promise<any> {
        try {
            console.log('form chat post', user, dto);
            //fetch receiver by dto
            const receiver = await this.UserRepo.findOne({
                where: {
                    MobileNumber: Number(dto.reciverNumber),
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
                    user_2: { MobileNumber: Number(dto.reciverNumber) },
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

                //Emit real-time update via sockets
                this.socketGateway.sendMessageToUser(String(receiver.id), {
                    fromUserId: user.id,
                    message: dto.meassage,
                    timestamp: date,
                });

                return {
                    Create_new_chat,
                    creat_chat_message,
                };
            }

            const create_chat_meassage = new ChatMeassage({
                ownerId: user.id,
                // receiverId: Number(dto.reciverid) as null,
                receiverId: receiver,
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

            find_chat.meassages.push(Number(create_chat_meassage.id));

            await this.ChatRepository.save(find_chat);

            //Emit real-time update via sockets
            this.socketGateway.sendMessageToUser(String(receiver.id), {
                fromUserId: user.id,
                message: dto.meassage,
                timestamp: date,
            });
            return {
                find_chat,
                create_chat_meassage,
            };
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async get_chat_meassages(user: any, receiverNumber: number) {
        try {
            //will require owner and receiver id's

            const find_chat = await this.ChatRepository.findOne({
                where: {
                    user_1: { id: user.id },
                    user_2: { MobileNumber: Number(receiverNumber) },
                },
            });

            if (!find_chat) {
                return {
                    message: 'No Chat Found',
                    status: HttpStatus.NOT_FOUND,
                };
            }

            const get_messages = await this.ChatMeassageRepo.find({
                where: {
                    ChatId: { id: find_chat.id },
                    IsActive: true,
                },
            });

            return {
                get_messages,
            };
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete_chat_meassages(user: any, dto: ChatDeleteDto) {
        try {
            //will require meassage id, chat id
            const delete_meassage = await this.ChatRepository.findOne({
                where: {
                    user_1: { id: user.id },
                    user_2: { id: Number(dto.receiverid) },
                },
            });

            if (!delete_meassage) {
                throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
            }

            const index = delete_meassage.meassages.indexOf(
                Number(dto.meassageid),
            );

            if (index === -1) {
                throw new HttpException(
                    'Message Not Found',
                    HttpStatus.NOT_FOUND,
                );
            }

            const find_message = await this.ChatMeassageRepo.findOne({
                where: {
                    id: dto.meassageid,
                },
            });

            delete_meassage.meassages.splice(index, 1);
            //set false in active chat
            if (find_message) {
                find_message.IsActive = false;

                await this.ChatMeassageRepo.save(find_message);
            }

            await this.ChatRepository.save(delete_meassage);

            return {
                message: 'Message deleted Successfully',
                delete_meassage,
            };
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async update_chat_message() {
        //require :--> communication between users, which message, new message
    }
}
