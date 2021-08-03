export interface CarContactProps {
    direction: number;
    heading: number;
    speedKmh: number;
    position: { x: number; y: number; z: number };
}

export default {
    fromBuffer(buffer: Buffer) {
        const [direction, heading, speed, z] = buffer;
        const x = buffer.readInt16LE(3);
        const y = buffer.readInt16LE(5);

        return {
            direction,
            heading,
            speedKmh: speed * 3.6,
            position: { x, y, z },
        };
    },
};
