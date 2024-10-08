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

    @Column('jsonb', { nullable: true })
    chatcontacts: any[];

    @Column()
    Created_At: Date;

    @Column({ default: false })
    IsValidated: boolean;
}
