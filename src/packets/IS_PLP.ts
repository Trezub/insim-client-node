export interface PlayerPitsProps {
    playerId: number;
}

export default {
    fromBuffer(buffer: Buffer): PlayerPitsProps {
        const [, , , playerId] = buffer;

        return {
            playerId,
        };
    },
};
