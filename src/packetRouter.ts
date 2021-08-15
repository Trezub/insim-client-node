import connectionController from './controllers/connectionController';
import healthController from './controllers/healthController';
import messageController from './controllers/messageController';
import playerController from './controllers/playerController';
import speedTrapController from './controllers/speedTrapController';
import zoneController from './controllers/zoneController';
import { PacketType } from './enums/PacketType';
import inSimClient from './inSimClient';
import log from './log';
import IS_BFN, { ButtonFunctionProps } from './packets/IS_BFN';
import IS_BTC, { ButtonClickProps } from './packets/IS_BTC';
import IS_BTT from './packets/IS_BTT';

import IS_CNL from './packets/IS_CNL';
import IS_CON from './packets/IS_CON';
import IS_CSC from './packets/IS_CSC';
import IS_MCI, { MulticarInfoProps } from './packets/IS_MCI';
import IS_MSO from './packets/IS_MSO';
import IS_NCI from './packets/IS_NCI';
import IS_NCN from './packets/IS_NCN';
import IS_NPL from './packets/IS_NPL';
import IS_OBH from './packets/IS_OBH';
import IS_PLL from './packets/IS_PLL';
import IS_PLP from './packets/IS_PLP';
import IS_STA, { StateProps } from './packets/IS_STA';
import IS_TINY, { TinyPacketSubType } from './packets/IS_TINY';
import IS_UCO from './packets/IS_UCO';

type HandlerFunction = (packet: any) => any;

const decoders: {
    [key: number]: (buffer: Buffer) => any;
} = {
    [PacketType.ISP_NCN]: IS_NCN.fromBuffer,
    [PacketType.ISP_CNL]: IS_CNL.fromBuffer,
    [PacketType.ISP_NCI]: IS_NCI.fromBuffer,
    [PacketType.ISP_PLL]: IS_PLL.fromBuffer,
    [PacketType.ISP_NPL]: IS_NPL.fromBuffer,
    [PacketType.ISP_PLP]: IS_PLP.fromBuffer,
    [PacketType.ISP_CSC]: IS_CSC.fromBuffer,
    [PacketType.ISP_MSO]: IS_MSO.fromBuffer,
    [PacketType.ISP_UCO]: IS_UCO.fromBuffer,
    [PacketType.ISP_MCI]: IS_MCI.fromBuffer,
    [PacketType.ISP_BTC]: IS_BTC.fromBuffer,
    [PacketType.ISP_BTT]: IS_BTT.fromBuffer,
    [PacketType.ISP_BFN]: IS_BFN.fromBuffer,
    [PacketType.ISP_OBH]: IS_OBH.fromBuffer,
    [PacketType.ISP_CON]: IS_CON.fromBuffer,
    [PacketType.ISP_STA]: IS_STA.fromBuffer,
    [PacketType.ISP_PEN]: IS_STA.fromBuffer,
    [PacketType.ISP_OBH]: IS_OBH.fromBuffer,
};

const routes: {
    [key: number]: HandlerFunction | HandlerFunction[];
} = {
    [PacketType.ISP_NCN]: (p) => connectionController.handleNewConnection(p),
    [PacketType.ISP_CNL]: (p) => connectionController.handleConnectionLeave(p),
    [PacketType.ISP_NCI]: (p) => connectionController.handleConnectionInfo(p),
    [PacketType.ISP_PLL]: (p) => playerController.handlePlayerLeave(p),
    [PacketType.ISP_NPL]: (p) => playerController.handleNewPlayer(p),
    [PacketType.ISP_PLP]: (p) => playerController.handlePlayerLeave(p),
    [PacketType.ISP_CSC]: (p) => zoneController.handleCarStateChange(p),
    [PacketType.ISP_MSO]: (p) => messageController.handleNewMessage(p),
    [PacketType.ISP_PEN]: (p) => inSimClient.handleNewPenalty(p),
    [PacketType.ISP_MCI]: (p) => playerController.handleCarInfo(p),
    [PacketType.ISP_OBH]: (p) => healthController.handlePlayerCrash(p),
    [PacketType.ISP_BTC]: (p: ButtonClickProps) =>
        connectionController.connections
            .get(p.connectionId)
            ?.gui?.handleClick(p),
    [PacketType.ISP_STA]: (p: StateProps) => {
        if (inSimClient.track !== p.track) {
            inSimClient.track = p.track;
            inSimClient.initTrafficLights();
        }
    },
    [PacketType.ISP_UCO]: [
        (p) => speedTrapController.handleUserControl(p),
        (p) => zoneController.handleUserControl(p),
        (p) => inSimClient.handleTrafficLightsTrapTrigger(p),
    ],

    // [PacketType.IS_BTT]: (p) =>
    // [PacketType.ISP_BFN]: (p) =>
    // [PacketType.ISP_OBH]: (p) =>
    // [PacketType.ISP_CON]: (p) =>
};

export default async function routePacket(buffer: Buffer) {
    if (buffer[1] === PacketType.ISP_TINY) {
        const packet = IS_TINY.fromBuffer(buffer);
        if (packet.subType === TinyPacketSubType.TINY_NONE) {
            // Ping packet
            await inSimClient.sendPacket(IS_TINY.fromProps(packet));
            return;
        }
    }

    const decoder = decoders[buffer[1]];
    if (!decoder) {
        log.warn(`Decoder not found for packet '${PacketType[buffer[1]]}'`);
        return;
    }

    const handler = routes[buffer[1]];
    if (!handler) {
        log.error(`Handler not found for packer '${PacketType[buffer[1]]}'`);
        return;
    }
    const packet = decoder(buffer);
    if (handler instanceof Array) {
        handler.forEach((h) => h(packet));
    } else {
        handler(packet);
    }
}
