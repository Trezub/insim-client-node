import { PacketType } from '../enums/PacketType';
import toByteArray from '../utils/toByteArray';

export enum MTCSound {
    SND_SILENT,
    SND_MESSAGE,
    SND_SYSMESSAGE,
    SND_INVALIDKEY,
    SND_ERROR,
    SND_NUM,
}

export interface MessageToConnectionProps {
    message: string;
    sound: MTCSound;
    connectionId?: number;
    playerId?: number;
}

export default {
    fromProps({
        message,
        sound,
        connectionId,
        playerId,
    }: MessageToConnectionProps) {
        return Buffer.from([
            (Math.ceil((message.length + 1) / 4) * 4 + 8) / 4,
            PacketType.ISP_MTC,
            0,
            sound,
            connectionId,
            playerId,
            0,
            0,
            ...toByteArray(message, Math.ceil((message.length + 1) / 4) * 4),
        ]);
    },
};
