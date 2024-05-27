import { Injectable } from '@nestjs/common';

@Injectable({})
export class ChatService {
    constructor() {}

    cretecommunication(req: any) {
        return req.user;
    }
    // Todo: create events based on user contacts --> it happen at the client side
    // Todo: show chat, save chat
}
