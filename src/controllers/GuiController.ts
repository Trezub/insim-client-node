import { lightBlue, lightGreen, red, white, yellow } from '../colors';
import inSimClient from '../inSimClient';
import IS_BTN, { ButtonStyle } from '../packets/IS_BTN';
import Connection from '../Connection';
import zones, { defaultZones, Zone } from '../zones';
import { isStreet, Street } from '../streets';
import IS_BFN, { ButtonFunction } from '../packets/IS_BFN';
import { ButtonClickProps } from '../packets/IS_BTC';
import log from '../log';
import sendMessageToConnection from '../helpers/sendMessageToConnection';

export type GuiButtonName = 'cash' | 'health' | 'car' | 'zone' | 'job';

export interface GuiControllerProps {
    connectionId: number;
}

export interface Component {
    left?: number | string;
    top?: number | string;
    height: number | string;
    width: number | string;
    styles?: (keyof typeof ButtonStyle)[];
    alwaysVisible?: boolean;
    text?: string;
    children?: Component[];
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
        this.createDefaultButtons();
    }

    async createDefaultButtons() {
        const { id: connectionId } = this.connection;

        this.buttonIds
            .set('car', this.buttonIds.size)
            .set('cash', this.buttonIds.size)
            .set('zone', this.buttonIds.size)
            .set('health', this.buttonIds.size)
            .set('job', this.buttonIds.size);

        await inSimClient.sendPacket(
            Buffer.from([
                ...IS_BTN.fromProps({
                    connectionId,
                    id: this.buttonIds.get('car'),
                    requestId: 1,
                    text: '',
                    height: 5,
                    width: 6,
                    top: 7,
                    left: 100 - 14,
                    style: ButtonStyle.DARK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: this.buttonIds.get('cash'),
                    requestId: 1,
                    text: `
                    ${this.connection.cash >= 0 ? lightGreen : red}R$${(
                        this.connection.cash / 100
                    ).toFixed(2)}`,
                    height: 5,
                    width: 15,
                    top: 7,
                    left: 93,
                    style: ButtonStyle.DARK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: this.buttonIds.get('health'),
                    requestId: 1,
                    text: `${white}Saúde: ${lightGreen}${this.connection.health}%`,
                    height: 5,
                    width: 15,
                    top: 7,
                    left: 109,
                    style: ButtonStyle.DARK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: this.buttonIds.get('zone'),
                    requestId: 1,
                    text: `${white}${defaultZones[inSimClient.track]}`,
                    height: 5,
                    width: 46,
                    top: 1,
                    left: 100 - 23,
                    style: ButtonStyle.DARK,
                }),
                ...IS_BTN.fromProps({
                    connectionId,
                    id: this.buttonIds.get('job'),
                    requestId: 1,
                    text: '',
                    height: 5,
                    width: 15,
                    top: 14,
                    left: 93,
                    style: ButtonStyle.DARK,
                }),
            ]),
        );
    }

    async handleCashUpdate() {
        await inSimClient.sendPacket(
            IS_BTN.fromProps({
                requestId: 1,
                id: this.buttonIds.get('cash'),
                text: `${this.connection.cash >= 0 ? lightGreen : red}R$${(
                    this.connection.cash / 100
                ).toFixed(2)}`,
                connectionId: this.connection.id,
            }),
        );
    }

    async handleHealthUpdate() {
        await inSimClient.sendPacket(
            IS_BTN.fromProps({
                requestId: 1,
                id: this.buttonIds.get('health'),
                text: `${white}Saúde: ${lightGreen}${this.connection.health}%`,
                connectionId: this.connection.id,
            }),
        );
    }

    async handleLocationUpdate() {
        await inSimClient.sendPacket(
            IS_BTN.fromProps({
                requestId: 1,
                id: this.buttonIds.get('zone'),
                text: `${white}${getLocationText(
                    this.connection.player?.location,
                )}`,
                connectionId: this.connection.id,
            }),
        );
    }

    async handleJobUpdate() {
        let jobName: string = '';
        if (this.connection.player?.job) {
            jobName = zones.find(
                (z) => z.id === this.connection.player.job.destination,
            ).name;
            await sendMessageToConnection(
                `${lightBlue}| ${white}Você pegou um trabalho para ${lightGreen}${jobName}${white}, entregue em tempo.`,
                this.connection,
                'system',
            );
            this.handleCloseClick();
        }
        await inSimClient.sendPacket(
            IS_BTN.fromProps({
                requestId: 1,
                id: this.buttonIds.get('job'),
                text: jobName,
                connectionId: this.connection.id,
            }),
        );
    }

    async handleCloseClick() {
        await inSimClient.sendPacket(
            IS_BFN.fromProps({
                buttonId: 90,
                buttonIdMax: 150,
                connectionId: this.connection.id,
                subType: ButtonFunction.BFN_DEL_BTN,
            }),
        );
    }

    async handleClick({ connectionId, requestId }: ButtonClickProps) {
        if (connectionId !== this.connection.id) {
            log.error(
                `connectionId (${connectionId}) doesnt match this.connection.id (${this.connection.id})`,
            );
            return;
        }
        if (requestId === 200) {
            this.handleCloseClick();
            return;
        }
        switch (requestId) {
            case 101:
            case 102:
            case 103: {
                this.connection.player.job =
                    this.connection.player.availableJobs[requestId - 101];
                this.connection.player.availableJobs[requestId - 101] = null;
                this.connection.player.availableJobs =
                    this.connection.player.createJobs();
                break;
            }
            default:
                break;
        }
        log.info(`${this.connection.username} clicked button ${requestId}`);
    }

    async render(component: Component, parent?: Component) {
        const bufferContent: number[] = [];
        const connectionId = this.connection.id;

        function calculateProp(value: string, baseValue: number) {}

        const sizing: {
            height: number;
            width: number;
            top: number;
            left: number;
        } = {
            top: null,
            left: null,
            width: null,
            height: null,
        };

        Object.keys(sizing).forEach((k) => {
            const expression = component[k as keyof Component];
            if (typeof expression === 'string') {
                if (!expression.endsWith('%')) {
                    throw new Error(
                        `Expected percentage value in property '${k}', got '${expression}'`,
                    );
                }
                const percent = parseInt(expression.slice(0, -1), 10);
                if (Number.isNaN(percent)) {
                    throw new Error(
                        `Invalid percent value in '${k}': '${expression}'`,
                    );
                }
                // sizing[k as keyof typeof sizing] = (parent[k as keyof Component] ?? )
            }
        });

        // bufferContent.push(...IS_BTN.fromProps({
        //     connectionId,
        //     id: 0,
        //     requestId: 0,
        //     height: ;
        // }));
    }

    connection: Connection;

    buttonIds = new Map<GuiButtonName, number>();
}
