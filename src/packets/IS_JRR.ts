import { PacketType } from '../enums/PacketType';
import ObjectInfo, { ObjectInfoProps } from './helpers/ObjectInfo';

export enum JRRAction {
    JRR_REJECT,
    JRR_SPAWN,
    JRR_2,
    JRR_3,
    JRR_RESET,
    JRR_RESET_NO_REPAIR,
    JRR_6,
    JRR_7,
}

export interface JoinRequestProps {
    connectionId?: number;
    playerId?: number;
    action: JRRAction;
    startPosition?: ObjectInfoProps;
}

export default {
    fromProps({
        action,
        connectionId,
        playerId,
        startPosition,
    }: JoinRequestProps) {
        return Buffer.from([
            16,
            PacketType.ISP_JRR,
            0,
            playerId,
            connectionId,
            action,
            0,
            0,
            ...ObjectInfo.fromProps(startPosition || {}),
        ]);
    },
};
