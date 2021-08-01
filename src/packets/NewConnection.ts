export interface NewConnectionProps {
    requestId: number;
    connectionId: number;
    username: string;
    nickname: string;
    isAdmin: boolean;
}

export function fromBuffer(buffer: Buffer): NewConnectionProps {
    const [, , requestId, connectionId] = buffer;
    const username = buffer.slice(4, 28).toString('utf-8');
    const nickname = buffer.slice(28, 53).toString('utf-8').slice(0);
    const [isAdmin] = buffer.slice(53);

    return {
        connectionId,
        requestId,
        isAdmin: Boolean(isAdmin),
        nickname: nickname.slice(0, nickname.indexOf('\0')),
        username: username.slice(0, username.indexOf('\0')),
    };
}
