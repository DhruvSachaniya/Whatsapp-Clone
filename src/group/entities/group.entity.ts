import { User } from 'src/auth/entities/user.entity';
import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Group extends AbstractEntity<Group> {
    @OneToOne(() => User, (user) => user.id)
    @JoinColumn()
    owner: User;

    @Column()
    group_name: string;

    @Column('jsonb', { nullable: true })
    members: any[];

    @Column('jsonb', { nullable: true })
    meassages: any[];

    @Column()
    Created_At: Date;
}
