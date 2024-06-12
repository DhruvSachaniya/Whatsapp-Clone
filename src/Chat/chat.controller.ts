import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Server } from 'socket.io';
import {
    MessageBody,
    SubscribeMessage,
    WebSocketServer,
} from '@nestjs/websockets';
import { SocketGateway } from 'src/gateway/socket.gateway';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ChatCreateDto } from './dto/chat-create.dto';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly socketgateway: SocketGateway,
        private chatservice: ChatService,
    ) {}

    //TODO:- create one to one chat, create chat_meassage entity,

    @WebSocketServer()
    private server: Server;

    @SubscribeMessage('832022')
    onNewMeassage(@MessageBody() body: any) {
        this.server.emit('832022', {
            msg: 'dhruv',
            content: body,
        });
        console.log('Received message:', body);
    }
    // user_1 will be get by jwtguard
    // user_2 number come by paramerter
    @UseGuards(JwtAuthGuard)
    @Post('create')
    createchat(@Request() req, @Body() dto: ChatCreateDto) {
        return this.chatservice.createchat(req.user, dto);
    }
    // subscribermeassage will be created by user mobilenumber
}
