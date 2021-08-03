import Connection from './Connection';
import connectionController from './controllers/connectionController';
import inSimClient from './inSimClient';
import IS_BTN from './packets/IS_BTN';
import { NewPlayerProps } from './packets/IS_NPL';
import { Zone } from './zones';

export type PlayerCar =
    | 'UF1'
    | 'XFG'
    | 'XRG'
    | 'LX4'
    | 'LX6'
    | 'RB4'
    | 'FXO'
    | 'XRT'
    | 'CAR'
    | 'FZ5'
    | 'UFR'
    | 'XFR'
    | 'FXR'
    | 'XRR'
    | 'FZR'
    | 'MRT'
    | 'FBM'
    | 'FOX'
    | 'FO8'
    | 'BF1';

export default class Player {
    constructor({
        car,
        connectionId,
        mass,
        plate,
        playerId,
        skin,
        intakeRestriction,
    }: NewPlayerProps) {
        // @ts-expect-error
        this.car = car;
        this.connection = connectionController.connections.get(connectionId);
        this.massKg = mass;
        this.id = playerId;
        this.skinName = skin;
        this.plate = plate;
        this.intakeRestriction = intakeRestriction;
    }

    id: number;

    connection: Connection;

    car: PlayerCar;

    plate: string;

    skinName: string;

    massKg: number;

    intakeRestriction: number;

    zone: Zone;

    position: {
        x: number;
        y: number;
        z: number;
    };

    heading: number;

    speedKmh: number;

    direction: number;
}
