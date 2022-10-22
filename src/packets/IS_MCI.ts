/* eslint-disable no-bitwise */
export interface CompCar {
    node: number;
    playerId: number;
    lagging: boolean;
    position: {
        x: number;
        y: number;
        z: number;
    };
    heading: number;
    direction: number;
    angularVelocity: number;
    speedKmh: number;
}
export interface MulticarInfoProps {
    requestId: number;
    cars: CompCar[];
}

export default {
    fromBuffer(buffer: Buffer): MulticarInfoProps {
        const [, , requestId, count] = buffer;
        const cars: CompCar[] = [];
        for (let i = 0; i < count; i++) {
            const subBuffer = buffer.slice(4 + 28 * i, 5 + 28 * i + 28);
            cars.push({
                node: subBuffer.readUInt16LE(0),
                lagging: Boolean(subBuffer[6] & 32),
                playerId: subBuffer[4],
                position: {
                    x:
                        Math.round((subBuffer.readInt32LE(8) / 65536) * 100) /
                        100,
                    y:
                        Math.round((subBuffer.readInt32LE(12) / 65536) * 100) /
                        100,
                    z:
                        Math.round((subBuffer.readInt32LE(16) / 65536) * 100) /
                        100,
                },
                speedKmh:
                    Math.round(
                        (subBuffer.readUInt16LE(20) / 32768) * 3.6 * 100 * 10,
                    ) / 10,
                direction:
                    Math.round(
                        (subBuffer.readUInt16LE(22) / 32768) * 360 * 10,
                    ) / 10,
                heading:
                    Math.round(
                        (subBuffer.readUInt16LE(24) / 32768) * 360 * 10,
                    ) / 10,
                angularVelocity: subBuffer.readUInt16LE(26),
            });
        }
        return {
            cars,
            requestId,
        };
    },
};
