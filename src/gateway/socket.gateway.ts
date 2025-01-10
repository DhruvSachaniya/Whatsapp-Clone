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

@WebSocketGateway(8080, { cors: { origin: '*' } }) // Adding CORS settings if needed
export class SocketGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    users: { [key: string]: string } = {};

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('Socket Server initialized');
    }

    handleConnection(client: Socket) {
        console.log('User connected with socketId:', client.id);
        // Register the socketId for a user
        this.users[client.id] = client.id;
        console.log('Current users:', this.users);
    }

    handleDisconnect(client: any) {
        console.log('Client disconnected', client.id);
        // Remove user from the mapping when disconnected
        for (const [userId, socketId] of Object.entries(this.users)) {
            if (socketId === client.id) {
                delete this.users[userId];
                break;
            }
        }
    }

    @SubscribeMessage('register')
    registerUser(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        // Register user with socket ID
        console.log('client', client.id);
        console.log(
            `User registered: ${data.userId} with socketId: ${client.id}`,
        );
        this.users[data.userId] = client.id;
    }

    @SubscribeMessage('privateMessage')
    sendMessage(
        @MessageBody() data: { toUserId: string; message: string },
        @ConnectedSocket() client: Socket, // Ensure that client is valid
    ) {
        // Log the users object to check if the recipient is registered
        console.log('Current users:', client.id);

        // Log the data for debugging
        console.log('Received privateMessage event with data:', data);

        // Lookup the socket ID of the recipient user
        const socketId = this.users[data.toUserId];
        console.log('Sending message to socketId:', socketId);

        // Ensure the socketId exists
        if (socketId) {
            // Send the message to the correct socket ID
            this.server.to(socketId).emit('privateMessage', {
                from: client.id, // Send the message from the client ID (sender)
                message: data.message,
            });
        } else {
            console.log('User not found for', data.toUserId);
        }
    }
}
