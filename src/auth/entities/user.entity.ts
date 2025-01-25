import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

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

    @ManyToMany(() => User, (user) => user.chatcontacts, {
        cascade: ['insert', 'update'],
    })
    @JoinTable({
        name: 'user_chatcontacts', // The table name for the join table
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'contact_id',
            referencedColumnName: 'id',
        },
    })
    chatcontacts: User[]; // List of contacts for this user

    @Column()
    Created_At: Date;

    @Column({ default: false })
    IsValidated: boolean;
}
