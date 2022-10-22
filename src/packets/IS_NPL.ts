export interface NewPlayerProps {
    requestId: number;
    playerId: number;
    connectionId: number;
    nickname: string;
    plate: string;
    car: string | number;
    skin: string;
    mass: number;
    intakeRestriction: number;
    isJoinRequest: boolean;
}

export default {
    fromBuffer(buffer: Buffer): NewPlayerProps {
        const [, , requestId, playerId, connectionId, , ,] = buffer;
        const nickname = buffer.slice(8, 32).toString('utf-8');
        const plate = buffer.slice(32, 40).toString('utf-8');

        const carSlice = buffer.slice(40, 44);
        const carAsString = carSlice.toString('utf-8');
        const car = /^[A-Z0-9\-_. ]{3}$/g.test(carAsString.slice(0, -1))
            ? carAsString.trim()
            : carSlice.readUInt32LE();

        const skin = buffer.slice(44, 60).toString('utf-8');
        const [mass, intakeRestriction] = buffer.slice(64);

        return {
            requestId,
            playerId,
            connectionId,
            nickname: nickname.slice(0, nickname.indexOf('\0')),
            plate: plate.slice(0, plate.indexOf('\0')),
            car:
                typeof car === 'string' ? car.slice(0, car.indexOf('\0')) : car,
            skin: skin.slice(0, skin.indexOf('\0')),
            mass,
            intakeRestriction,
            isJoinRequest: buffer[73] === 0,
        };
    },
};
