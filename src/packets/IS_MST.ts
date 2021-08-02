import { PacketType } from '../enums/PacketType';
import toByteArray from '../utils/toByteArray';

export enum UserType {
    MSO_SYSTEM, // 0 - system message
    MSO_USER, // 1 - normal visible user message
    MSO_PREFIX, // 2 - hidden message starting with special prefix (see ISI)
    MSO_O, // 3 - hidden message typed on local pc with /o command
    MSO_NUM,
}

export interface SendMessageProps {
    message: string;
    connectionId?: number;
    playerId?: number;
    userType?: UserType;
    playerName?: string;
}

export default {
    fromBuffer(buffer: Buffer): SendMessageProps {
        const [connectionId, playerId, userType, textStart] = buffer.slice(4);
        const msg = buffer.slice(8).toString('utf-8');
        const playerName = msg.slice(0, textStart - 5);
        const messageText = msg.slice(textStart, msg.indexOf('\0'));
        return {
            message: messageText,
            playerName,
            playerId,
            connectionId,
            userType,
        };
    },
    fromProps({ message }: SendMessageProps) {
        return Buffer.from([
            68,
            PacketType.ISP_MST,
            0,
            0,
            ...toByteArray(message, 64),
        ]);
    },
};
