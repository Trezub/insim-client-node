import Connection from './Connection';
import connectionController from './controllers/connectionController';
import correiosController from './controllers/correiosController';
import { PlayerCar as PlayerCarEnum } from './enums/PlayerCar';
import inSimClient from './inSimClient';
import jobs, { Job } from './jobs';
import IS_BTN from './packets/IS_BTN';
import { NewPlayerProps } from './packets/IS_NPL';
import { Street } from './streets';
import { Zone } from './zones';

export type PlayerCar = keyof typeof PlayerCarEnum;

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
        this.connection.gui.handleLocationUpdate();
        this.availableJobs = this.createJobs();
    }

    id: number;

    connection: Connection;

    car: PlayerCar;

    plate: string;

    skinName: string;

    massKg: number;

    intakeRestriction: number;

    position: {
        x: number;
        y: number;
        z: number;
    };

    heading: number;

    speedKmh: number;

    direction: number;

    jobTimeout: NodeJS.Timeout;

    availableJobs: Job[] = [null, null, null];

    private _job: Job;

    get job() {
        return this._job;
    }

    set job(job: Job) {
        this._job = job;
        this.connection.gui.handleJobUpdate();
        if (job) {
            this.jobTimeout = setTimeout(
                () => correiosController.handleJobExpired(this),
                job.timeout,
            );
        }
    }

    private _location: Zone | Street;

    previousLocation: Zone | Street;

    get location() {
        return this._location;
    }

    set location(value: Zone | Street) {
        this.previousLocation = this._location;
        this._location = value;
        this.connection.gui.handleLocationUpdate();
    }

    createJobs() {
        return this.availableJobs.map(
            (j) => j || jobs[Math.round(Math.random() * (jobs.length - 1))],
        );
    }
}
