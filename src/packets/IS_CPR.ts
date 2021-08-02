export interface PlayerRenameProps {
    connectionId: number;
    nickname: string;
    plate: string;
}

export default {
    fromBuffer(buffer: Buffer): PlayerRenameProps {
        const [, , , connectionId] = buffer;
        const nickname = buffer.slice(4, 28).toString('utf-8');
        const plate = buffer.slice(28, 36).toString('utf-8');

        return {
            connectionId,
            nickname: nickname.slice(0, nickname.indexOf('\0')),
            plate: plate.slice(0, plate.indexOf('\0')),
        };
    },
};
