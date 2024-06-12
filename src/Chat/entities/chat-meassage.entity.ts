import { User } from 'src/auth/entities/user.entity';
import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class ChatMeassage extends AbstractEntity<ChatMeassage> {
    @Column()
    meassage: string;

    //will require -> who's created, one chat will have only one owner, and who's to send
    @OneToOne(() => User)
    @JoinColumn()
    ownerId: number;

    @OneToOne(() => User)
    @JoinColumn()
    receiverId: number;
}
