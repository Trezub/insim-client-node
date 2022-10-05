import { white, yellow } from '../colors';
import fines from '../fines';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import inSimClient from '../inSimClient';
import log from '../log';
import { UserControlObjectsProps } from '../packets/IS_UCO';
import speedTraps from '../speedTraps';
import { isStreet } from '../streets';
import playerController from './playerController';

class SpeedTrapController {
    async handleUserControl({ object, playerId }: UserControlObjectsProps) {
        if (object.id !== 252) {
            // 252 checkpoint
            return;
        }
        const player = playerController.players.get(playerId);
        if (!player) {
            log.error(
                `Received UCO but player isnt in race. PlayerId: ${playerId}.`,
            );
            return;
        }
        if (!isStreet(player.location)) {
            return;
        }
        if (!player.location.speedLimit) {
            return;
        }
        if (
            !speedTraps[inSimClient.track].some(
                (s) => s.x === object.position.x && s.y === object.position.y,
            )
        ) {
            return;
        }

        const { speedLimit } = player.location;
        const playerSpeed = player.speedKmh;
        const consideredSpeed =
            speedLimit > 100
                ? playerSpeed - (playerSpeed / 100) * 0.07 * 100
                : playerSpeed - 7;

        if (consideredSpeed > speedLimit) {
            const exceededSpeed = consideredSpeed - speedLimit;
            const exceededSpeedPercent = (exceededSpeed / speedLimit) * 100;

            let fineLevel: number;
            if (exceededSpeedPercent < 20) {
                fineLevel = 0;
            } else if (
                exceededSpeedPercent >= 20 &&
                exceededSpeedPercent <= 50
            ) {
                fineLevel = 1;
            } else {
                fineLevel = 2;
            }
            const fineLevelNames = ['< 20%', '20% - 50%', '> 50%'];
            player.connection.cash -= fines.speed[fineLevel];
            await Promise.all([
                sendMessageToConnection(
                    `${yellow}`.padEnd(50, '-'),
                    player,
                    'error',
                ),
                sendMessageToConnection(
                    `${yellow}| ${'Multa por excesso de velocidade'.padStart(
                        51,
                        ' ',
                    )}`,
                    player,
                ),
                sendMessageToConnection(
                    `${yellow}| Local: ${white}${player.location.name}`,
                    player,
                ),
                sendMessageToConnection(
                    `${yellow}| Velocidade aferida: ${white}${playerSpeed.toFixed(
                        1,
                    )}KM/h`,
                    player,
                ),
                sendMessageToConnection(
                    `${yellow}| Velocidade considerada: ${white}${consideredSpeed.toFixed(
                        1,
                    )}KM/h (${fineLevelNames[fineLevel]})`,
                    player,
                ),
                sendMessageToConnection(
                    `${yellow}| Velocidade máxima no local: ${white}${speedLimit.toFixed(
                        1,
                    )}KM/h`,
                    player,
                ),
                sendMessageToConnection(
                    `${yellow}| Valor: ${white}R$${(
                        fines.speed[fineLevel] / 100
                    ).toFixed(2)}`,
                    player,
                ),
                sendMessageToConnection(`${yellow}`.padEnd(50, '-'), player),
                /*
                IS.SendMTC_MessageToConnection("^3| ^7Camera: ^3TGPR-" + data.ToString("000"), UCID);
                //inSim.sendMTC_MessageToConnection("^3| ^7Velocidade registrada: ^3" + speed + "km/h", UCID);
                IS.SendMTC_MessageToConnection("^3| ^7Velocidade Considerada: ^3" + speedConv + "km/h", UCID);
                IS.SendMTC_MessageToConnection("^3| ^7Velocidade máxima no local: ^3" + speedLimit + "km/h", UCID);
                IS.SendMTC_MessageToConnection("^3| ^7Valor: ^3R$" + price + ",00", UCID);
                //inSim.sendMTC_MessageToConnection("^3| ^7Pague no detran mais próximo.", UCID);
                IS.SendMTC_MessageToConnection("^3-------------------------------------------------", UCID);
                */
            ]);
        }
    }
}

export default new SpeedTrapController();
