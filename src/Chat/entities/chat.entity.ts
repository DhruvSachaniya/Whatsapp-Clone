import { User } from 'src/auth/entities/user.entity';
import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity()
export class Chat extends AbstractEntity<Chat> {
    // user_1 connect with userid
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn()
    user_1: User;
    // user_2
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn()
    user_2: User;
    // meassages list insted of this add chat id as connnection
    @Column('jsonb', { nullable: true })
    meassages: any[];
}
