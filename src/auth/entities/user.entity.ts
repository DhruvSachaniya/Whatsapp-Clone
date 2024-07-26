import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends AbstractEntity<User> {
    @Column('bigint')
    MobileNumber: number;

    @Column('text')
    UserName: string;

    @Column('text', { nullable: true })
    Email: string;

    @Column()
    Password: string;

    @Column('text', { nullable: true })
    UserPhotoUrl: string;

    @Column('jsonb', { nullable: true })
    groupcontacts: any[];

    //contact it will store the chat id's or group id's
    @Column('jsonb', { nullable: true })
    chatcontacts: any[];

    @Column()
    Created_At: Date;
}
