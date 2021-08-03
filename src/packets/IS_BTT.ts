export interface ButtonTypeProps {
    requestId: number;
    connectionId: number;
    buttonId: number;
    typeIn: number;
    text: string;
}

export default {
    fromBuffer(buffer: Buffer): ButtonTypeProps {
        const [, , requestId, connectionId, buttonId, , typeIn] = buffer;
        const text = buffer.slice(8).toString('utf-8');
        return {
            requestId,
            connectionId,
            buttonId,
            text: text.slice(0, text.indexOf('\0')),
            typeIn,
        };
    },
};
