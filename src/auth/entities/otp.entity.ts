import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Otp extends AbstractEntity<Otp> {
    @Column('int')
    Otp: number;
    //when created,
}
