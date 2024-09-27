import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class SecurityCode extends AbstractEntity<SecurityCode> {
    @Column('text')
    code: string;

    @Column('text')
    email: string;

    @Column('timestamp')
    createdat: string;

    @Column('timestamp')
    expireat: string;
}
