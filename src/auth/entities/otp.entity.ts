import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Otp extends AbstractEntity<Otp> {
    @Column('int')
    Otp: number;

    @Column('text')
    email: string;

    @Column('timestamp')
    createdat: string;

    @Column('timestamp')
    expireat: string;
}
