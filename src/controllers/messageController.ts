import { lightBlue, white, yellow } from '../colors';
import inSimClient from '../inSimClient';
import log from '../log';
import { SendMessageProps, UserType } from '../packets/IS_MSO';
import IS_MTC, { MTCSound } from '../packets/IS_MTC';
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
        if (userType === UserType.MSO_PREFIX) {
            switch (message.slice(1)) {
                case 'coords': {
                    const player = playerController.players.get(playerId);
                    await inSimClient.sendPacket(
                        IS_MTC.fromProps({
                            message: `${lightBlue}|${white} X: ${yellow}${player.position.x} ${white}Y: ${yellow}${player.position.y} ${white}Z: ${yellow}${player.position.z} ${white}H: ${yellow}${player.direction}º`,
                            sound: MTCSound.SND_SYSMESSAGE,
                            connectionId,
                        }),
                    );
                    break;
                }
                default:
                    break;
            }
        }
        log.silly(`${playerName}: ${message}`);
    }
}
export default new MessageController();
