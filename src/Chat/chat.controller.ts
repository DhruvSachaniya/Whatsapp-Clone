import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
    MessageBody,
    SubscribeMessage,
    WebSocketServer,
} from '@nestjs/websockets';
import { SocketGateway } from 'src/gateway/socket.gateway';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ChatMeassageDto } from './dto/chat-meassage.dto';
import { ChatDeleteDto } from './dto/chat-delete.dto';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly socketgateway: SocketGateway,
        private chatservice: ChatService,
    ) {}

    @WebSocketServer()
    private server: Server;

    @UseGuards(JwtAuthGuard)
    @Post('meassage')
    post_chat_meassage(@Request() req, @Body() dto: ChatMeassageDto) {
        return this.chatservice.post_chat_meassage(req.user, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('meassage')
    get_chat_meassage(@Request() req, @Body('receiverId') receiverId: number) {
        return this.chatservice.get_chat_meassages(req.user, receiverId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('meassage')
    delete_chat_meassage(@Request() req, @Body() dto: ChatDeleteDto) {
        return this.chatservice.delete_chat_meassages(req.user, dto);
    }

    // @Post('register')
    // register(@Body() body: { userId: string; socketId: string }) {
    //     console.log(
    //         'Registering user with ID:',
    //         body.userId,
    //         'Socket ID:',
    //         body.socketId,
    //     );
    //     const mockSocket = { id: body.socketId } as Socket;
    //     this.socketgateway.registerUser(body, mockSocket);
    // }

    // @Post('postMessage')
    // sendMessage(
    //     @Body() body: { toUserId: string; message: string; socketId: string },
    // ) {
    //     console.log('1', body);
    //     // Ensure the socketId is passed correctly, and we pass the correct mock socket
    //     const mockSocket = { id: body.socketId } as Socket;

    //     if (!mockSocket.id) {
    //         console.error('Socket ID is missing');
    //         return;
    //     }

    //     this.socketgateway.sendMessage(
    //         { toUserId: body.toUserId, message: body.message },
    //         mockSocket,
    //     );
    // }
}
