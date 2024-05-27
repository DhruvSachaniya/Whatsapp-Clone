import { User } from 'src/auth/entities/user.entity';
import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class GroupMessage extends AbstractEntity<GroupMessage> {
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn()
    owner: User;

    @Column()
    message: string;

    @ManyToOne(() => Group, (group) => group.id)
    @JoinColumn()
    group: Group;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
