import { PacketType } from '../enums/PacketType';
import toByteArray from '../utils/toByteArray';

// IS_ISI - InSimInit

export interface InSimInitProps {
    flags: number;
    adminPassword: string;
    appName: string;
    inSimVersion: number;
    udpPort: number;
    prefixChar: string;
    interval: number;
}

export default {
    fromProps({
        flags,
        adminPassword,
        inSimVersion,
        appName,
        udpPort,
        prefixChar,
        interval,
    }: InSimInitProps) {
        return Buffer.from([
            44, // Size
            PacketType.ISP_ISI,
            0,
            0,
            udpPort & 255,
            udpPort >> 8,
            flags & 255,
            flags >> 8,
            inSimVersion,
            prefixChar.charCodeAt(0),
            interval & 255,
            interval >> 8,
            ...toByteArray(adminPassword, 16),
            ...toByteArray(appName, 16),
        ]);
    },
};
