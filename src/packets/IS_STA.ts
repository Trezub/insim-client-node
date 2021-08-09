export interface StateProps {
    track: string;
    requestId: number;
}

export default {
    fromBuffer(buffer: Buffer): StateProps {
        return {
            track: buffer.slice(20, 24).toString('utf-8'),
            requestId: buffer[2],
        };
    },
};
