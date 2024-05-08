import { Controller } from '@nestjs/common';
import { Server } from 'socket.io';
import {
    MessageBody,
    SubscribeMessage,
    WebSocketServer,
} from '@nestjs/websockets';
import { SocketGateway } from 'src/gateway/socket.gateway';

@Controller('chat')
export class ChatController {
    constructor(private readonly socketgateway: SocketGateway) {}

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
    // subscribermeassage will be created by user mobilenumber
}
