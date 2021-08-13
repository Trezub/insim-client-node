import CarContOBJ, { CarContactProps } from './helpers/CarContOBJ';

export interface ObjectHitProps {
    playerId: number;
    closingSpeed: number;
    car: CarContactProps;
    position: { x: number; y: number; z: number };
    index: number;
    flags: ObjectHitFlags;
}

export enum ObjectHitFlags {
    OBH_LAYOUT = 1, // an added object
    OBH_CAN_MOVE = 2, // a movable object
    OBH_WAS_MOVING = 4, // was moving before this hit
    OBH_ON_SPOT = 8, // object in original position
}

export default {
    fromBuffer(buffer: Buffer): ObjectHitProps {
        const [, , , playerId] = buffer;
        const closingSpeed = buffer.readUInt16LE(4);
        const car = CarContOBJ.fromBuffer(buffer.slice(8, 16));
        const x = buffer.readInt16LE(16);
        const y = buffer.readInt16LE(18);
        const [z, , index, flags] = buffer.slice(20);
        return {
            playerId,
            closingSpeed,
            car,
            position: { x, y, z },
            flags,
            index,
        };
    },
};
