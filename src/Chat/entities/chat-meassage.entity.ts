import { User } from 'src/auth/entities/user.entity';
import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class ChatMeassage extends AbstractEntity<ChatMeassage> {
    @Column()
    meassage: string;

    //will require -> who's created, one chat will have only one owner, and who's to send
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn()
    ownerId: User;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn()
    receiverId: User;

    @ManyToOne(() => Chat, (chat) => chat.id)
    @JoinColumn()
    ChatId: Chat;

    @Column({ nullable: true })
    Created_At: Date;

    @Column({ default: true })
    IsActive: boolean;
}
