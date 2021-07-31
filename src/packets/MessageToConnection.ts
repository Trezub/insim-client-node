import { PacketType } from '../enums/PacketType';

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
    connectionId: number;
    playerId: number;
}

export default function MessageToConnection({
    message,
    sound,
    connectionId,
    playerId,
}: MessageToConnectionProps) {
    return Buffer.from([
        Math.ceil(message.length / 4) * 4 + 8,
        PacketType.ISP_MTC,
        0,
        sound,
        connectionId,
        playerId,
        0,
        0,
    ]);
}
