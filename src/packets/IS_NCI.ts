import { Language } from '../enums/Languages';

export interface NewConnectionInfoProps {
    requestId: number;
    connectionId: number;
    language: Language;
    userId: number;
    ipAddress: string;
}

export default {
    fromBuffer(buffer: Buffer): NewConnectionInfoProps {
        const [, , requestId, connectionId, language] = buffer;
        const userId = buffer.readUInt16LE(7);
        const ipAddress = buffer.slice(12, 16).join('.');

        return {
            requestId,
            connectionId,
            ipAddress,
            language,
            userId,
        };
    },
};
