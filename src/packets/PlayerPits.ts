export interface PlayerPitsProps {
    playerId: number;
}

export function fromBuffer(buffer: Buffer): PlayerPitsProps {
    const [, , , playerId] = buffer;

    return {
        playerId,
    };
}
