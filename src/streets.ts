import { Zone } from './zones';

export interface Street {
    name: string;
    speedLimit?: number;
}

export interface StreetCheckpoint {
    x: number;
    y: number;
    z: number;
    forward?: Street;
    backwards?: Street;
}

export function isStreet(location: Zone | Street): location is Street {
    return location != null && 'speedLimit' in location;
}

const streets: {
    [key: string]: StreetCheckpoint[];
} = {
    SO1X: [
        {
            forward: {
                name: 'Pits',
                speedLimit: 80,
            },
            x: 21517,
            y: 3668,
            z: 0,
        },
        {
            backwards: {
                name: 'Pits',
                speedLimit: 80,
            },
            forward: {
                name: 'Pits',
                speedLimit: 80,
            },
            x: -24049,
            y: -606,
            z: 3,
        },
    ],
};

export default streets;
