import { PacketType } from '../enums/PacketType';
import { TinyPacketSubType } from '../enums/TinyPacketSubType';

export interface InSimTinyProps {
    subType: TinyPacketSubType;
    requestId: number;
}

export function fromProps({ subType, requestId }: InSimTinyProps) {
    return Buffer.from([4, PacketType.ISP_TINY, requestId, subType]);
}

export function fromBuffer(buffer: Buffer): InSimTinyProps {
    const [, , requestId, subType] = buffer;
    return {
        requestId,
        subType,
    };
}
