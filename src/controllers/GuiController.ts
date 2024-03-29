import { lightGreen, red, white, yellow } from '../colors';
import inSimClient from '../inSimClient';
import IS_BTN, { ButtonStyle } from '../packets/IS_BTN';
import Connection from '../Connection';
import zones, { defaultZones, Zone } from '../zones';
import { isStreet, Street } from '../streets';
import jobs from '../jobs';

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
                    style: ButtonStyle.ISB_DARK,
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
                    style: ButtonStyle.ISB_DARK,
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
                    style: ButtonStyle.ISB_DARK,
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
                    style: ButtonStyle.ISB_DARK,
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
                    style: ButtonStyle.ISB_DARK,
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
                    this.connection.player.location,
                )}`,
                connectionId: this.connection.id,
            }),
        );
    }

    async handleJobUpdate() {
        await inSimClient.sendPacket(
            IS_BTN.fromProps({
                requestId: 1,
                id: this.buttonIds.get('job'),
                text: this.connection.player?.job
                    ? zones.find(
                        (z) =>
                            z.id === this.connection.player.job.destination,
                    ).name
                    : '',
                connectionId: this.connection.id,
            }),
        );
    }

    connection: Connection;

    buttonIds = new Map<GuiButtonName, number>();
}
