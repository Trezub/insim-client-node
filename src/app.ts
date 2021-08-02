import net from 'net';
import { promisify } from 'util';
import { InSimInitFlag } from './enums/InSimInitFlag';

import log from './log';

import { TinyPacketSubType } from './enums/TinyPacketSubType';
import { PacketType } from './enums/PacketType';

// Controllers
import messageController from './controllers/messageController';
import connectionController from './controllers/connectionController';
import playerController from './controllers/playerController';
import speedTrapController from './controllers/speedTrapController';
import zoneController from './controllers/zoneController';

// Packets
import IS_MST from './packets/IS_MST';
import IS_TINY from './packets/IS_TINY';
import IS_NPL from './packets/IS_NPL';
import IS_NCN from './packets/IS_NCN';
import IS_PLL from './packets/IS_PLL';
import IS_NCI from './packets/IS_NCI';
import IS_UCO from './packets/IS_UCO';
import IS_CSC from './packets/IS_CSC';
import IS_ISI from './packets/IS_ISI';
import IS_MTC, { MTCSound } from './packets/IS_MTC';
import IS_OCO, {
    ObjectControlIndex,
    ObjectControlLight,
} from './packets/IS_OCO';
import { ObjectControlAction } from './enums/ObjectControlAction';

const client = new net.Socket();
export const sendPacket = promisify(client.write.bind(client));

async function decodePacket(buffer: Buffer) {
    const [, type] = buffer;
    // console.log(`Received ${PacketType[type]}`);
    switch (type) {
        case PacketType.ISP_MSO:
            messageController.handleNewMessage(IS_MST.fromBuffer(buffer));
            break;
        case PacketType.ISP_TINY: {
            const packet = IS_TINY.fromBuffer(buffer);
            if (packet.subType === TinyPacketSubType.TINY_NONE) {
                await sendPacket(IS_TINY.fromProps(packet));
            }
            break;
        }
        case PacketType.ISP_NPL:
            playerController.handleNewPlayer(IS_NPL.fromBuffer(buffer));
            break;
        case PacketType.ISP_NCN:
            connectionController.handleNewConnection(IS_NCN.fromBuffer(buffer));
            break;
        case PacketType.ISP_PLL:
            playerController.handlePlayerLeave(IS_PLL.fromBuffer(buffer));
            break;
        case PacketType.ISP_PLP:
            playerController.handlePlayerLeave(IS_PLL.fromBuffer(buffer));
            break;
        case PacketType.ISP_NCI:
            connectionController.handleConnectionInfo(
                IS_NCI.fromBuffer(buffer),
            );
            break;
        case PacketType.ISP_UCO:
            {
                const uco = IS_UCO.fromBuffer(buffer);
                speedTrapController.handleUserControl(uco);
                zoneController.handleUserControl(uco);
            }
            break;
        case PacketType.ISP_CSC:
            zoneController.handleCarStateChange(IS_CSC.fromBuffer(buffer));
            break;
        default:
            log.silly(`Received packet ${PacketType[buffer[1]]}`);
            break;
    }
}

setTimeout(() => {
    try {
        client.connect({
            host: process.env.SERVER_IP,
            port: Number(process.env.INSIM_PORT),
        });
    } catch (err) {
        log.error(`Error connecting to InSim server: ${err}`);
    }
    client.on('data', (originalBuffer) => {
        let buffer = originalBuffer;
        while (buffer.length > 0) {
            const size = buffer.readUInt8();
            decodePacket(buffer.copyWithin(0, 0, size));
            buffer = buffer.slice(size);
        }
    });
    client.on('connect', async () => {
        log.info('Connected to InSim.');
        await sendPacket(
            // Send insim init packet.
            IS_ISI.fromProps({
                adminPassword: process.env.INSIM_ADMIN_PASSWORD,
                appName: process.env.INSIM_APP_NAME,
                flags: InSimInitFlag.ISF_AXM_EDIT | InSimInitFlag.ISF_AXM_LOAD,
                inSimVersion: 8,
                interval: 10,
                prefixChar: '!',
                udpPort: 0,
            }),
        );
        await sendPacket(
            // Motd
            IS_MTC.fromProps({
                message: '^6| ^7Bem vindo(a) ao ^2Cruise ^3Brasil',
                sound: MTCSound.SND_SYSMESSAGE,
                connectionId: 255,
            }),
        );
        await sendPacket(
            // Request NCN packets.
            IS_TINY.fromProps({
                requestId: 255,
                subType: TinyPacketSubType.TINY_NCN,
            }),
        );
        await sendPacket(
            // Request NCI Packets.
            IS_TINY.fromProps({
                requestId: 255,
                subType: TinyPacketSubType.TINY_NCI,
            }),
        );
        await sendPacket(
            // Request NPL Packets.
            IS_TINY.fromProps({
                requestId: 255,
                subType: TinyPacketSubType.TINY_NPL,
            }),
        );
        await sendPacket(
            // Set all traffic lights to red.
            IS_OCO.fromProps({
                action: ObjectControlAction.OCO_LIGHTS_SET,
                id: 255,
                lights: ObjectControlLight.RED,
                mainLights: ObjectControlIndex.AXO_START_LIGHTS,
            }),
        );
    });
}, 2000);
