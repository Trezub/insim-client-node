import { PacketType } from '../enums/PacketType';
import { PlayerCar } from '../enums/PlayerCar';

export interface PlayerCarsProps {
    connectionId: number;
    cars: PlayerCar;
}

export default {
    fromProps({ connectionId, cars }: PlayerCarsProps) {
        const buffer = Buffer.alloc(12, 0, 'binary');
        buffer.writeUInt8(12, 0);
        buffer.writeUInt8(PacketType.ISP_PLC, 1);
        buffer.writeUInt8(connectionId, 4);
        buffer.writeUInt16LE(cars, 8);
        return buffer;
    },
};
