import { Language } from '@prisma/client';

export interface NewConnectionInfoProps {
    requestId: number;
    connectionId: number;
    language: Language;
    userId: number;
    ipAddress: string;
}

export default {
    fromBuffer(buffer: Buffer): NewConnectionInfoProps {
        const [, , requestId, connectionId, languageIndex] = buffer;
        const userId = buffer.readUInt32LE(8);
        const ipAddress = buffer.slice(12, 16).join('.');
        const languages = Object.keys(Language) as Language[];

        return {
            requestId,
            connectionId,
            ipAddress,
            language: languages[languageIndex],
            userId,
        };
    },
};
