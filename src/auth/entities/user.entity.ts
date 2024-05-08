import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends AbstractEntity<User> {
    @Column()
    MobileNumber: number;

    @Column('text')
    UserName: string;

    @Column()
    Password: string;

    // chat

    // group

    @Column()
    Created_At: Date;
}
