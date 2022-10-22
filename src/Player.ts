import { Car } from '@prisma/client';
import { white } from './colors';
import Connection from './Connection';
import connectionController from './controllers/connectionController';
import correiosController from './controllers/correiosController';
import jobs, { Job } from './jobs';
import { NewPlayerProps } from './packets/IS_NPL';
import { Street } from './streets';
import { Zone } from './zones';

export default class Player {
    constructor({
        car,
        connectionId,
        mass,
        plate,
        playerId,
        skin,
        intakeRestriction,
    }: Omit<NewPlayerProps, 'car'> & {
        car: Car;
    }) {
        this.connection = connectionController.connections.get(connectionId);
        this.car = car;
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

    private _car?: Car;

    get car() {
        return this._car;
    }

    set car(value: Car | null) {
        this._car = value;
        this.connection.gui.hud.getChild('car').text = `${white}${
            this.car?.name ?? ''
        }`;
    }

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
