import { lightBlue, lightGreen, red, white, yellow } from '../colors';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import inSimClient from '../inSimClient';
import log from '../log';
import { ObjectInfoFlag } from '../packets/helpers/ObjectInfo';
import IS_JRR, { JRRAction } from '../packets/IS_JRR';
import { SendMessageProps, UserType } from '../packets/IS_MSO';
import IS_MTC, { MTCSound } from '../packets/IS_MTC';
import { isStreet } from '../streets';
import getDistanceMeters from '../utils/getDistanceMeters';
import connectionController from './connectionController';
import correiosController from './correiosController';
import playerController from './playerController';

class MessageController {
    async handleNewMessage({
        message,
        connectionId,
        playerId,
        playerName,
        userType,
    }: SendMessageProps) {
        if (connectionId === 0) {
            return;
        }
        const connection = connectionController.connections.get(connectionId);
        const player = playerController.players.get(playerId);

        if (userType === UserType.MSO_PREFIX) {
            switch (message.slice(1).split(' ')[0]) {
                case 'coords': {
                    await inSimClient.sendPacket(
                        IS_MTC.fromProps({
                            message: `${lightBlue}|${white} X: ${yellow}${player.position.x} ${white}Y: ${yellow}${player.position.y} ${white}Z: ${yellow}${player.position.z} ${white}H: ${yellow}${player.direction}º`,
                            sound: MTCSound.SND_SYSMESSAGE,
                            connectionId,
                        }),
                    );
                    break;
                }
                case 'distance': {
                    const args = message.slice(1).split(' ').slice(1);
                    if (args.length !== 2) {
                        sendMessageToConnection(
                            `${red}| ${white}Uso correto: ${lightGreen}!tp <x> <y>`,
                            connection,
                            'error',
                        );
                        return;
                    }
                    const [x, y] = args;
                    sendMessageToConnection(
                        `${lightBlue}| ${yellow}${getDistanceMeters(
                            player.position,
                            { x: Number(x), y: Number(y) },
                        )}m ${white}from ${yellow}x: ${x} y: ${y}`,
                        connection,
                        'system',
                    );
                    return;
                }
                case 'cash': {
                    const [, amount] = message.split(' ');
                    if (!amount) {
                        sendMessageToConnection(
                            `${red}| ${white}Formato: ${lightGreen}!cash <quantidade>`,
                            connection,
                            'error',
                        );
                        return;
                    }
                    if (connection.isAdmin) {
                        connection.cash = Number(amount) * 100;
                    } else {
                        sendMessageToConnection(
                            `${red}| ${white}Você não tem permissão para usar este comando!`,
                            connection,
                            'error',
                        );
                        return;
                    }
                    break;
                }
                case 'job': {
                    if (
                        !connection.player ||
                        (!isStreet(connection.player.location) &&
                            connection.player.location?.id !== 4)
                    ) {
                        sendMessageToConnection(
                            `${red}| ${white}Você precisa estar nos Correios para usar este comando!`,
                            connection,
                            'error',
                        );
                        return;
                    }
                    correiosController.createJob(connection.player);
                    break;
                }
                case 'tp':
                    {
                        const args = message.slice(1).split(' ').slice(1);
                        if (args.length !== 2) {
                            sendMessageToConnection(
                                `${red}| ${white}Uso correto: ${lightGreen}!tp <x> <y>`,
                                connection,
                                'error',
                            );
                            return;
                        }
                        const [x, y] = args;
                        await inSimClient.sendPacket(
                            IS_JRR.fromProps({
                                playerId,
                                action: JRRAction.JRR_RESET_NO_REPAIR,
                                startPosition: {
                                    flags: ObjectInfoFlag.SetStartPoint,
                                    heading: 0,
                                    position: {
                                        x: Number(x),
                                        y: Number(y),
                                        z: 0,
                                    },
                                },
                            }),
                        );
                    }
                    break;
                default:
                    break;
            }
        }
        log.silly(`${playerName}: ${message}`);
    }
}
export default new MessageController();
