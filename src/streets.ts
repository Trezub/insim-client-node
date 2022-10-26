export interface Street {
    name: string;
    speedLimit?: number;
}

export interface StreetCheckpoint {
    x: number;
    y: number;
    forward?: Street;
    backwards?: Street;
}

const streets = {
    pits: {
        name: 'Pits',
        speedLimit: 80,
    },
    avAyrtonSenna: {
        name: 'Av. Ayrton Senna',
        speedLimit: 80,
    },
};

const streetCheckpoints: {
    [key: string]: StreetCheckpoint[];
} = {
    SO1X: [
        {
            backwards: streets.pits,
            x: 242.63,
            y: -37.88,
        },
        {
            backwards: streets.pits,
            x: 208,
            y: 229.25,
        },
        {
            forward: streets.avAyrtonSenna,
            x: 194.38,
            y: -203.63,
        },
    ],
};

export default streetCheckpoints;
