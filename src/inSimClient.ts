import net from 'net';
import { promisify } from 'util';
import { white } from './colors';
import playerController from './controllers/playerController';
import TrafficLightsController from './controllers/TrafficLightsController';

import log from './log';
import routePacket from './packetRouter';

import IS_ISI, { InSimInitFlag } from './packets/IS_ISI';
import IS_MST from './packets/IS_MST';
import IS_MTC, { MTCSound } from './packets/IS_MTC';
import IS_OCO, {
    ObjectControlAction,
    ObjectControlLight,
    ObjectControlIndex,
} from './packets/IS_OCO';
import { Penalty, PenaltyProps } from './packets/IS_PEN';
import IS_TINY, { TinyPacketSubType } from './packets/IS_TINY';
import { UserControlObjectsProps } from './packets/IS_UCO';
import trafficLights from './trafficLights';

export class InSimClient {
    incompletePacket: Buffer;

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
                // Is the rest of a LFS packet that was slices between two network packets
                if (this.incompletePacket) {
                    buffer = Buffer.concat([this.incompletePacket, buffer]);
                    this.incompletePacket = null;
                }

                const size = buffer[0] * 4; // Insim v9: Now the packet size byte is divided by 4

                // LFS packet is not complete. Stores it and waits for the next network packet
                if (buffer.length < size) {
                    if (this.incompletePacket) {
                        throw new Error('Two incomplete packets arrived.');
                    }
                    this.incompletePacket = buffer;
                    return;
                }
                routePacket(buffer.slice(0, size));
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
                        // eslint-disable-next-line no-bitwise
                        InSimInitFlag.ISF_AXM_EDIT |
                        InSimInitFlag.ISF_AXM_LOAD |
                        InSimInitFlag.ISF_REQ_JOIN |
                        InSimInitFlag.ISF_MCI |
                        InSimInitFlag.ISF_OBH |
                        InSimInitFlag.ISF_CON,
                    inSimVersion: 9,
                    interval: 100,
                    prefixChar: '!',
                    udpPort: 0,
                }),
            );
            this.init();
        });
    }

    async handleNewPenalty({ playerId, newPenalties }: PenaltyProps) {
        const player = playerController.players.get(playerId);
        if (!player) {
            return;
        }
        if (newPenalties !== Penalty.PENALTY_NONE) {
            setTimeout(() => {
                this.sendPacket(
                    IS_MST.fromProps(`/p_clear ${player.connection.username}`),
                );
            }, 10000);
        }
    }

    async init() {
        await this.sendPacket(
            Buffer.from([
                // Motd
                ...IS_MTC.fromProps({
                    message:
                        process.env.NODE_ENV === 'development'
                            ? `^6| ^7Bem vindo(a) ao ^2Cruise ^3Brasil ${white}(${process.env.INSIM_APP_NAME})`
                            : '^6| ^7Bem vindo(a) ao ^2Cruise ^3Brasil',
                    sound: MTCSound.SND_SYSMESSAGE,
                    connectionId: 255,
                }),
                // Request track info
                ...IS_TINY.fromProps({
                    requestId: 255,
                    subType: TinyPacketSubType.TINY_SST,
                }),
                // Request NCN packets.
                ...IS_TINY.fromProps({
                    requestId: 255,
                    subType: TinyPacketSubType.TINY_NCN,
                }),
                // Request NCI Packets.
                ...IS_TINY.fromProps({
                    requestId: 255,
                    subType: TinyPacketSubType.TINY_NCI,
                }),
                // Request NPL Packets.
                ...IS_TINY.fromProps({
                    requestId: 255,
                    subType: TinyPacketSubType.TINY_NPL,
                }),
                // Request AXM Packets.
                ...IS_TINY.fromProps({
                    requestId: 255,
                    subType: TinyPacketSubType.TINY_AXM,
                }),
            ]),
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

        let yellowLight = false;
        setInterval(() => {
            this.sendPacket(
                IS_OCO.fromProps({
                    action: ObjectControlAction.OCO_LIGHTS_SET,
                    id: 0,
                    lights: yellowLight ? ObjectControlLight.AMBER : 0,
                }),
            );
            yellowLight = !yellowLight;
        }, 1000);
    }

    handleTrafficLightsTrapTrigger(uco: UserControlObjectsProps) {
        this.trafficLightControllers.forEach((controller) => {
            controller.handleTrapTrigger(uco);
        });
    }

    initTrafficLights() {
        this.trafficLightControllers.forEach((controller) =>
            controller.dispose(),
        );
        const lights = trafficLights[this.track];
        lights?.forEach((ids) => {
            this.trafficLightControllers.push(
                new TrafficLightsController(18000, ids),
            );
        });
    }

    client: net.Socket;

    track: string;

    trafficLightControllers: TrafficLightsController[] = [];

    sendPacket: (arg1: string | Uint8Array) => Promise<void>;
}

export default new InSimClient();
