import { PacketType } from '../enums/PacketType';
import toByteArray from '../utils/toByteArray';

export default {
    fromProps(message: string) {
        return Buffer.from([
            68 / 4,
            PacketType.ISP_MST,
            0,
            0,
            ...toByteArray(message, 64),
        ]);
    },
};
