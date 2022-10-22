import { lightBlue, lightGreen, red, white, yellow } from '../colors';
import inSimClient from '../inSimClient';
import Connection from '../Connection';
import zones, { defaultZones, Zone } from '../zones';
import { isStreet, Street } from '../streets';
import { ButtonClickProps } from '../packets/IS_BTC';
import {
    createComponent,
    deleteComponent,
    ProxiedUiComponent,
} from '../utils/ui';
import sendMessageToConnection from '../helpers/sendMessageToConnection';

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
                    {
                        name: 'job',
                        left: 0,
                        top: 10,
                        height: 5,
                        width: 40,

                        alwaysVisible: true,
                        style: 'dark',
                        text: '',
                    },
                ],
            },
        });
    }

    async handleLocationUpdate() {
        this.hud.getChild('location').text = `${white}${getLocationText(
            this.connection.player?.location,
        )}`;
    }

    async handleJobUpdate() {
        let jobName: string = '';
        if (this.connection.player?.job) {
            jobName = zones.find(
                (z) => z.id === this.connection.player.job.destination,
            ).name;
            await sendMessageToConnection(
                `${lightBlue}| ${white}Você pegou um trabalho para ${lightGreen}${jobName}${white}. entregue em tempo.`,
                this.connection,
                'system',
            );
            this.hud.getChild('job').text = `Entrega ativa: ${white}${
                zones.find(
                    (z) => z.id === this.connection.player.job.destination,
                ).name
            }`;
            return;
        }
        this.hud.getChild('job').text = '';
    }

    async handleClick(packet: ButtonClickProps) {
        const handler = this.clickHandlers.get(packet.buttonId);
        handler?.(packet);
    }

    hud: ProxiedUiComponent;

    private _openWindow: ProxiedUiComponent;

    get openWindow() {
        return this._openWindow;
    }

    set openWindow(value) {
        deleteComponent(this._openWindow);
        this._openWindow = value;
    }

    connection: Connection;

    buttonIds = new Set<number>();

    clickHandlers = new Map<number, (packet: ButtonClickProps) => any>();
}
