export interface CarStateChangedProps {
    playerId: number;
    stopped: boolean;
    direction: number;
    heading: number;
    speedKmh: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
}

export function fromBuffer(buffer: Buffer): CarStateChangedProps {
    const [, , , playerId, , action] = buffer;
    const [direction, heading, speed, z] = buffer.slice(12);
    const x = buffer.readInt8(16);
    const y = buffer.readInt8(18);

    return {
        playerId,
        stopped: !action,
        direction,
        heading,
        position: {
            x,
            y,
            z,
        },
        speedKmh: speed * 3.6,
    };
}
