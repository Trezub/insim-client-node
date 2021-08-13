import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Language } from '../../enums/Languages';
import { PlayerCar } from '../../Player';

@Entity()
export class User {
    @PrimaryColumn({ unique: true })
    id: number;

    @CreateDateColumn()
    createdAt: number;

    @UpdateDateColumn()
    updatedAt: number;

    @Column({ default: 0 })
    cash: number;

    @Column({ default: 100 })
    health: number;

    @Column({ type: 'simple-array', default: 'UF1' })
    cars: PlayerCar[];

    @Column({ unique: true })
    username: string;

    @Column({ type: 'text' })
    lastIPAddress: string;

    @Column({ enum: Language })
    language: number;

    @Column({ default: 0 })
    backCash: number;
}
