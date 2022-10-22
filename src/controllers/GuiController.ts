import { lightBlue, lightGreen, red, white, yellow } from '../colors';
import inSimClient from '../inSimClient';
import Connection from '../Connection';
import { defaultZones, Zone } from '../zones';
import { isStreet, Street } from '../streets';
import { ButtonClickProps } from '../packets/IS_BTC';
import { createComponent, ProxiedUiComponent } from '../utils/ui';

export type GuiButtonName = 'cash' | 'health' | 'car' | 'zone' | 'job';

export interface GuiControllerProps {
    connectionId: number;
}

function getLocationText(location: Zone | Street): string {
    if (location != null) {
        if (isStreet(location)) {
            return `${location.name}${
                location.speedLimit
                    ? ` ${yellow}(${location.speedLimit}KM/H)`
                    : ''
            }`;
        }
        return `${location.name}`;
    }
    return defaultZones[inSimClient.track];
}

export default class GuiController {
    constructor(connection: Connection) {
        this.connection = connection;
    }

    getNextButtonId() {
        for (let i = 0; i < 240; i++) {
            if (!this.buttonIds.has(i)) {
                this.buttonIds.add(i);
                return i;
            }
        }
        throw new Error(
            `No more button ids available on connection ${this.connection.id}`,
        );
    }

    createHud() {
        const { id: connectionId } = this.connection;

        this.hud = createComponent({
            connectionId,
            props: {
                isVirtual: true,
                top: 1,
                left: 80,
                height: 10,
                width: 20,
                children: [
                    {
                        name: 'cash',
                        left: 0,
                        top: 0,
                        height: 5,
                        width: 10,

                        alwaysVisible: true,
                        style: 'dark',
                        text: '',
                    },
                    {
                        name: 'car',
                        left: 10,
                        top: 0,
                        height: 5,
                        width: 20,

                        alwaysVisible: true,
                        style: 'dark',
                        text: '',
                    },
                    {
                        name: 'health',
                        left: 30,
                        top: 0,
                        height: 5,
                        width: 10,

                        alwaysVisible: true,
                        style: 'dark',
                        text: '',
                    },
                    {
                        name: 'location',
                        left: 0,
                        top: 5,
                        height: 5,
                        width: 40,

                        alwaysVisible: true,
                        style: 'dark',
                        text: `${white}${getLocationText(
                            this.connection.player?.location,
                        )}`,
                    },
                ],
            },
        });

        // this.buttonIds
        //     .set('car', this.buttonIds.size)
        //     .set('cash', this.buttonIds.size)
        //     .set('zone', this.buttonIds.size)
        //     .set('health', this.buttonIds.size)
        //     .set('job', this.buttonIds.size);
        // await inSimClient.sendPacket(
        //     Buffer.from([
        //         ...IS_BTN.fromProps({
        //             connectionId,
        //             id: this.buttonIds.get('car'),
        //             requestId: 1,
        //             text: '',
        //             height: 5,
        //             width: 6,
        //             top: 7,
        //             left: 100 - 14,
        //             style: ButtonStyle.DARK,
        //         }),
        //         ...IS_BTN.fromProps({
        //             connectionId,
        //             id: this.buttonIds.get('cash'),
        //             requestId: 1,
        //             text: `
        //             ${this.connection.cash >= 0 ? lightGreen : red}R$${(
        //                 this.connection.cash / 100
        //             ).toFixed(2)}`,
        //             height: 5,
        //             width: 15,
        //             top: 7,
        //             left: 93,
        //             style: ButtonStyle.DARK,
        //         }),
        //         ...IS_BTN.fromProps({
        //             connectionId,
        //             id: this.buttonIds.get('health'),
        //             requestId: 1,
        //             text: `${white}Saúde: ${lightGreen}${this.connection.health}%`,
        //             height: 5,
        //             width: 15,
        //             top: 7,
        //             left: 109,
        //             style: ButtonStyle.DARK,
        //         }),
        //         ...IS_BTN.fromProps({
        //             connectionId,
        //             id: this.buttonIds.get('zone'),
        //             requestId: 1,
        //             text: `${white}${defaultZones[inSimClient.track]}`,
        //             height: 5,
        //             width: 46,
        //             top: 1,
        //             left: 100 - 23,
        //             style: ButtonStyle.DARK,
        //         }),
        //         ...IS_BTN.fromProps({
        //             connectionId,
        //             id: this.buttonIds.get('job'),
        //             requestId: 1,
        //             text: '',
        //             height: 5,
        //             width: 15,
        //             top: 14,
        //             left: 93,
        //             style: ButtonStyle.DARK,
        //         }),
        //     ]),
        // );
    }

    async handleCashUpdate() {
        // await inSimClient.sendPacket(
        //     IS_BTN.fromProps({
        //         requestId: 1,
        //         id: this.buttonIds.get('cash'),
        //         text: `${this.connection.cash >= 0 ? lightGreen : red}R$${(
        //             this.connection.cash / 100
        //         ).toFixed(2)}`,
        //         connectionId: this.connection.id,
        //     }),
        // );
    }

    async handleHealthUpdate() {
        // await inSimClient.sendPacket(
        //     IS_BTN.fromProps({
        //         requestId: 1,
        //         id: this.buttonIds.get('health'),
        //         text: `${white}Saúde: ${lightGreen}${this.connection.health}%`,
        //         connectionId: this.connection.id,
        //     }),
        // );
    }

    async handleLocationUpdate() {
        // await inSimClient.sendPacket(
        //     IS_BTN.fromProps({
        //         requestId: 1,
        //         id: this.buttonIds.get('zone'),
        //         text: `${white}${getLocationText(
        //             this.connection.player?.location,
        //         )}`,
        //         connectionId: this.connection.id,
        //     }),
        // );
    }

    async handleJobUpdate() {
        // let jobName: string = '';
        // if (this.connection.player?.job) {
        //     jobName = zones.find(
        //         (z) => z.id === this.connection.player.job.destination,
        //     ).name;
        //     await sendMessageToConnection(
        //         `${lightBlue}| ${white}Você pegou um trabalho para ${lightGreen}${jobName}${white}, entregue em tempo.`,
        //         this.connection,
        //         'system',
        //     );
        //     this.handleCloseClick();
        // }
        // await inSimClient.sendPacket(
        //     IS_BTN.fromProps({
        //         requestId: 1,
        //         id: this.buttonIds.get('job'),
        //         text: jobName,
        //         connectionId: this.connection.id,
        //     }),
        // );
    }

    async handleClick(packet: ButtonClickProps) {
        const handler = this.clickHandlers.get(packet.buttonId);
        handler?.(packet);
    }

    hud: ProxiedUiComponent;

    connection: Connection;

    buttonIds = new Set<number>();

    clickHandlers = new Map<number, (packet: ButtonClickProps) => any>();
}
