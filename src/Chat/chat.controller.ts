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
import { WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ChatMeassageDto } from './dto/chat-meassage.dto';
import { ChatDeleteDto } from './dto/chat-delete.dto';

@Controller('chat')
export class ChatController {
    constructor(private chatservice: ChatService) {}

    @WebSocketServer()
    private server: Server;

    @UseGuards(JwtAuthGuard)
    @Post('meassage')
    post_chat_meassage(@Request() req, @Body() dto: ChatMeassageDto) {
        return this.chatservice.post_chat_meassage(req.user, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('meassage')
    get_chat_meassage(
        @Request() req,
        @Body('receiverNumber') receiverNumber: number,
    ) {
        return this.chatservice.get_chat_meassages(req.user, receiverNumber);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('meassage')
    delete_chat_meassage(@Request() req, @Body() dto: ChatDeleteDto) {
        return this.chatservice.delete_chat_meassages(req.user, dto);
    }
}
