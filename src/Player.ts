import Connection from './Connection';

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
    // constructor(npl) {}

    id: number;

    connection: Connection;

    car: PlayerCar;

    plate: string;

    skinName: string;

    massKg: number;

    intakeRestriction: number;
}
