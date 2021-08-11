import { white, yellow } from '../colors';
import fines from '../fines';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import inSimClient from '../inSimClient';
import log from '../log';
import IS_OCO, { ObjectControlLight } from '../packets/IS_OCO';
import { UserControlObjectsProps } from '../packets/IS_UCO';
import Player from '../Player';
import semaphoreTraps from '../semaphoreTraps';
import delay from '../utils/delay';
import { defaultZones } from '../zones';
import playerController from './playerController';

export default class TrafficLightsController {
    openPhase: number = 0;

    ids: number[];

    async handleTrapTrigger({
        action,
        object,
        car,
        playerId,
    }: UserControlObjectsProps) {
        if (object.id !== 252) {
            return;
        }
        const player = playerController.players.get(playerId);
        if (!player) {
            return log.error(
                `Received UCO but player isnt in race. PlayerId: ${playerId}.`,
            );
        }
        const trap = semaphoreTraps[inSimClient.track].find(
            (s) => s.x === object.position.x && s.y === object.position.y,
        );
        if (!trap) {
            return;
        }
        if (!this.ids.includes(trap.id)) {
            return;
        }
        if (this.ids[this.openPhase] === trap.id) {
            return;
        }

        const fine = fines.semaphore;
        player.connection.cash -= fine;
        await Promise.all([
            sendMessageToConnection(
                `${yellow}`.padEnd(50, '-'),
                player,
                'error',
            ),
            sendMessageToConnection(
                `${yellow}| ${'Multa por cruzar o sinal vermelho'.padStart(
                    51,
                    ' ',
                )}`,
                player,
                'error',
            ),
            sendMessageToConnection(
                `${yellow}| Local: ${white}${
                    player.location?.name || defaultZones[inSimClient.track]
                }`,
                player,
                'error',
            ),
            sendMessageToConnection(
                `${yellow}| Valor: ${white}R$${(fines.semaphore / 100).toFixed(
                    2,
                )}`,
                player,
                'error',
            ),
            sendMessageToConnection(
                `${yellow}`.padEnd(50, '-'),
                player,
                'error',
            ),
        ]);
    }

    dispose() {
        this.timeouts.forEach(clearTimeout);
        clearInterval(this.interval);
    }

    timeouts: NodeJS.Timeout[];

    interval: NodeJS.Timeout;

    constructor(greenTime: number, ids: number[]) {
        this.ids = ids;
        inSimClient.sendPacket(
            IS_OCO.fromProps({
                id: ids[0],
                action: 5,
                lights: ObjectControlLight.GREEN,
            }),
        );
        setInterval(async () => {
            await inSimClient.sendPacket(
                IS_OCO.fromProps({
                    id: ids[this.openPhase],
                    action: 5,
                    lights: ObjectControlLight.AMBER,
                }),
            );
            await delay(3000);
            await inSimClient.sendPacket(
                IS_OCO.fromProps({
                    id: ids[this.openPhase],
                    action: 5,
                    lights: ObjectControlLight.RED,
                }),
            );
            if (this.openPhase < ids.length) {
                this.openPhase += 1;
            } else {
                this.openPhase = 0;
            }
            await delay(3000);
            await inSimClient.sendPacket(
                IS_OCO.fromProps({
                    id: ids[this.openPhase],
                    action: 5,
                    lights: ObjectControlLight.GREEN,
                }),
            );
        }, greenTime);
    }
}
