import { Zone } from './zones';

export interface Street {
    x: number;
    y: number;
    z: number;
    name: string;
    speedLimit: number;
}

export function isStreet(location: Zone | Street): location is Street {
    return location != null && 'speedLimit' in location;
}

const streets: {
    [key: string]: Street[];
} = {
    SO1X: [
        {
            name: 'Pits',
            speedLimit: 80,
            x: 22796,
            y: 3673,
            z: 0,
        },
    ],
};

export default streets;
