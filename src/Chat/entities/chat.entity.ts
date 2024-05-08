import { User } from 'src/auth/entities/user.entity';
import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Chat extends AbstractEntity<Chat> {
    // user_1 connect with userid
    @OneToOne(() => User)
    @JoinColumn()
    user_1: User;
    // user_2
    @OneToOne(() => User)
    @JoinColumn()
    user_2: User;
    // meassages list
    @Column()
    meassages: [];
}
