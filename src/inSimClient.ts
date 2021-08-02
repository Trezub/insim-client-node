import net from 'net';
import { promisify } from 'util';

import log from './log';
import routePacket from './packetRouter';

import IS_ISI, { InSimInitFlag } from './packets/IS_ISI';
import IS_MTC, { MTCSound } from './packets/IS_MTC';
import IS_OCO, {
    ObjectControlAction,
    ObjectControlLight,
    ObjectControlIndex,
} from './packets/IS_OCO';
import IS_TINY, { TinyPacketSubType } from './packets/IS_TINY';

export class InSimClient {
    constructor() {
        this.client = new net.Socket();
        this.sendPacket = promisify(this.client.write.bind(this.client));

        try {
            this.client.connect({
                host: process.env.SERVER_IP,
                port: Number(process.env.INSIM_PORT),
            });
        } catch (err) {
            log.error(`Error connecting to InSim server: ${err}`);
        }

        this.client.on('data', (originalBuffer) => {
            let buffer = originalBuffer;
            while (buffer.length > 0) {
                const size = buffer.readUInt8();
                routePacket(buffer.copyWithin(0, 0, size));
                buffer = buffer.slice(size);
            }
        });

        this.client.on('connect', async () => {
            log.info('Connected to InSim.');
            await this.sendPacket(
                // Send insim init packet.
                IS_ISI.fromProps({
                    adminPassword: process.env.INSIM_ADMIN_PASSWORD,
                    appName: process.env.INSIM_APP_NAME,
                    flags:
                        InSimInitFlag.ISF_AXM_EDIT | InSimInitFlag.ISF_AXM_LOAD,
                    inSimVersion: 8,
                    interval: 500,
                    prefixChar: '!',
                    udpPort: 0,
                }),
            );
            this.init();
        });
    }

    async init() {
        await this.sendPacket(
            // Motd
            IS_MTC.fromProps({
                message: '^6| ^7Bem vindo(a) ao ^2Cruise ^3Brasil',
                sound: MTCSound.SND_SYSMESSAGE,
                connectionId: 255,
            }),
        );
        await this.sendPacket(
            // Request NCN packets.
            IS_TINY.fromProps({
                requestId: 255,
                subType: TinyPacketSubType.TINY_NCN,
            }),
        );
        await this.sendPacket(
            // Request NCI Packets.
            IS_TINY.fromProps({
                requestId: 255,
                subType: TinyPacketSubType.TINY_NCI,
            }),
        );
        await this.sendPacket(
            // Request NPL Packets.
            IS_TINY.fromProps({
                requestId: 255,
                subType: TinyPacketSubType.TINY_NPL,
            }),
        );
        await this.sendPacket(
            // Set all traffic lights to red.
            IS_OCO.fromProps({
                action: ObjectControlAction.OCO_LIGHTS_SET,
                id: 255,
                lights: ObjectControlLight.RED,
                mainLights: ObjectControlIndex.AXO_START_LIGHTS,
            }),
        );
    }

    client: net.Socket;

    sendPacket: (arg1: string | Uint8Array) => Promise<void>;
}

export default new InSimClient();
