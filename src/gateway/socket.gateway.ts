import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8080, { cors: { origin: '*' } })
export class SocketGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    users: { [key: string]: string } = {}; // Map userId to socketId

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('Socket Server initialized');
    }

    handleConnection(client: Socket) {
        console.log('Client connected:');
        console.log('User connected with socketId:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);

        // Remove the user mapping when a user disconnects
        for (const [userId, socketId] of Object.entries(this.users)) {
            if (socketId === client.id) {
                delete this.users[userId];
                break;
            }
        }

        this.broadcastUserList();
    }

    @SubscribeMessage('register')
    registerUser(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        // Check if the user is already registered
        if (this.users[data.userId]) {
            console.log(
                `User ${data.userId} is already registered with socketId ${this.users[data.userId]}`,
            );
            return;
        }

        // Register the user with their socket ID
        this.users[data.userId] = client.id;
        // console.log(
        //     `User ${data.userId} registered with socketId ${client.id}`,
        // );
        this.broadcastUserList();
    }

    //NOTE:- For now the double message one is chnaged base on timestamp varification
    @SubscribeMessage('privateMessage')
    sendMessage(
        @MessageBody()
        data: { toUserId: string; message: string; from_number: string },
        @ConnectedSocket() client: Socket,
    ) {
        const recipientSocketId = this.users[data.toUserId];

        if (recipientSocketId) {
            const msg = {
                from_number: data.from_number,
                from: client.id,
                message: data.message,
                timestamp: Date.now(), // Add a unique timestamp
            };

            // Send the message to the recipient
            this.server
                .to(recipientSocketId)
                .emit('privateMessageReceived', msg);

            // console.log('Message sent:', msg);
        } else {
            console.log('Recipient not connected:', data.toUserId);
        }
    }

    sendMessageToUser(toUserId: string, message: any) {
        const socketId = this.users[toUserId];
        if (socketId) {
            this.server.to(socketId).emit('privateMessageReceived', message);
        } else {
            console.log('User is offline:', toUserId);
        }
    }

    private broadcastUserList() {
        console.log('Broadcasting user list:', this.users);
        this.server.emit('userList', this.users);
    }

    @SubscribeMessage('callUser')
    handleCallUser(
        @MessageBody()
        data: {
            userToCall: string;
            signalData: any;
            from: string;
            name: string;
        },
        @ConnectedSocket() client: Socket,
    ) {
        console.log("📥 Received 'callUser' event on backend!");
        console.log('Received Data:', data);

        // Look up socketId by userId if userToCall is not a socketId
        const recipientSocketId = Object.keys(this.users).includes(
            data.userToCall,
        )
            ? this.users[data.userToCall]
            : data.userToCall; // Fallback to socketId if provided directly

        console.log('Recipient socket ID:', recipientSocketId);

        if (recipientSocketId) {
            this.server.to(recipientSocketId).emit('callUser', {
                signal: data.signalData,
                from: data.from,
                name: data.name,
            });
            console.log('📡 Sent callUser event to recipient!');
        } else {
            console.log('❌ User is offline or not found:', data.userToCall);
        }
    }

    @SubscribeMessage('answerCall')
    handleAnswerCall(
        @MessageBody() data: { signal: any; to: string },
        @ConnectedSocket() client: Socket,
    ) {
        const recipientSocketId = this.users[data.to];

        if (recipientSocketId) {
            this.server.to(recipientSocketId).emit('callAccepted', data.signal);
        } else {
            console.log('Caller is not online:', data.to);
        }
    }
}
