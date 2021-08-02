export interface PlayerLeaveProps {
    playerId: number;
}

export function fromBuffer(buffer: Buffer): PlayerLeaveProps {
    const [, , , playerId] = buffer;

    return {
        playerId,
    };
}
