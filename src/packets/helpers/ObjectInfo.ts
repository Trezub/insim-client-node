import log from '../../log';

export enum ObjectInfoFlag {
    DefaultStartPoint,
    SetStartPoint = 0x80,
}

export interface ObjectInfoProps {
    heading?: number;
    position?: { x: number; y: number; z: number };
    id?: number;
    flags?: ObjectInfoFlag;
}

export default {
    fromBuffer(buffer: Buffer): ObjectInfoProps {
        const x = buffer.readInt16LE() / 16;
        const y = buffer.readInt16LE(2) / 16;
        const [z, , id, heading] = buffer.slice(4);
        log.info({
            heading,
            id,
            position: { x, y, z },
        });
        return {
            heading: (heading * 180) / 128,
            id,
            position: { x, y, z },
        };
    },
    fromProps({ heading, position, flags }: ObjectInfoProps) {
        const buffer = Buffer.alloc(8, 0, 'binary');
        buffer.writeInt16LE(position?.x * 16);
        buffer.writeInt16LE(position?.y * 16, 2);
        buffer.writeUInt8(position?.z, 4);
        buffer.writeUInt8(flags, 5);
        buffer.writeUInt8(0, 6);
        buffer.writeUInt8(Math.min((heading * 128) / 180, 255), 7);
        log.info(this.fromBuffer(buffer));
        return buffer;
    },
};
