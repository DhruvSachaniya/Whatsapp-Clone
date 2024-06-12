import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends AbstractEntity<User> {
    @Column('bigint')
    MobileNumber: number;

    @Column('text')
    UserName: string;

    @Column()
    Password: string;

    // chat

    // group

    //contact it will store the chat id's or group id's

    @Column()
    Created_At: Date;
}
