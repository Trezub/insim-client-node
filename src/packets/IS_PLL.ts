export interface PlayerLeaveProps {
    playerId: number;
}

export default {
    fromBuffer(buffer: Buffer): PlayerLeaveProps {
        const [, , , playerId] = buffer;

        return {
            playerId,
        };
    },
};
