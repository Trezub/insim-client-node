export interface NewPlayerProps {
    requestId: number;
    playerId: number;
    connectionId: number;
    nickname: string;
    plate: string;
    car: string;
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
        const car = buffer.slice(40, 44).toString('utf-8');
        const skin = buffer.slice(44, 60).toString('utf-8');
        const [mass, intakeRestriction] = buffer.slice(64);

        return {
            requestId,
            playerId,
            connectionId,
            nickname: nickname.slice(0, nickname.indexOf('\0')),
            plate: plate.slice(0, plate.indexOf('\0')),
            car: car.slice(0, car.indexOf('\0')),
            skin: skin.slice(0, skin.indexOf('\0')),
            mass,
            intakeRestriction,
            isJoinRequest: buffer[73] === 0,
        };
    },
};
