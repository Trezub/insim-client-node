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
            backwards: {
                name: 'Pits',
                speedLimit: 80,
            },
            x: 242.625,
            y: -37.875,
            z: 3,
        },
        {
            backwards: {
                name: 'Pits',
                speedLimit: 80,
            },
            x: 208,
            y: 229.25,
            z: 0,
        },
    ],
};

export default streets;
