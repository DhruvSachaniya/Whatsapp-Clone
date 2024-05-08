import { OnModuleInit } from '@nestjs/common';
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(8080)
export class SocketGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server;

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log(socket.id);
        });
    }

    @SubscribeMessage('832022')
    onNewMeassage(@MessageBody() body: any) {
        this.server.emit('832022', {
            msg: 'dhruv',
            content: body,
        });
        console.log('Received message:', body);
    }

    @SubscribeMessage('123456')
    onNewMeassage2(@MessageBody() body: any) {
        this.server.emit('123456', {
            msg: 'test',
            content: body,
        });
        console.log('Received message:', body);
    }
}
