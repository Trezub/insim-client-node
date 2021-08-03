export interface CarContactProps {
    playerId: number;
    info: number;
    steer: number;
    throttle: number;
    brake: number;
    clutch: number;
    handbrake: number;
    gear: number;
    speed: number;
    direction: number;
    heading: number;
    accelerationF: number;
    accelerationR: number;
    position: { x: number; y: number };
}

export default {
    fromBuffer(buffer: Buffer): CarContactProps {
        const [
            playerId,
            info,
            ,
            steer,
            throttle,
            brake,
            clutch,
            handbrake,
            gear,
            ,
            speed,
            direction,
            heading,
            accelerationF,
            accelerationR,
        ] = buffer;
        return {
            playerId,
            info,
            steer,
            throttle,
            brake,
            clutch,
            handbrake,
            gear,
            speed,
            direction,
            heading,
            accelerationF,
            accelerationR,
            position: { x: buffer.readInt16LE(12), y: buffer.readInt16LE(14) },
        };
    },
};
