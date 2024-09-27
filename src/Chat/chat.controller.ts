import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { Server } from 'socket.io';
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
}
