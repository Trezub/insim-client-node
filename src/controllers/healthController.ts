import { red, yellow } from '../colors';
import Connection from '../Connection';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import inSimClient from '../inSimClient';
import log from '../log';
import IS_MST from '../packets/IS_MST';
import { ObjectHitFlags, ObjectHitProps } from '../packets/IS_OBH';

class HealthController {
    async handlePlayerDied(connection: Connection) {
        sendMessageToConnection(
            `${red}| ${yellow}O jogador ${connection.nickname} morreu`,
            connection,
            'error',
        );
        inSimClient.sendPacket(
            IS_MST.fromProps(`/spec ${connection.username}`),
        );
    }

    async handlePlayerCrash({
        car,
        closingSpeed,
        playerId,
        index,
        flags,
    }: ObjectHitProps) {
        // if (
        //     flags === ObjectHitFlags.OBH_CAN_MOVE ||
        //     flags === ObjectHitFlags.OBH_WAS_MOVING||
        // ) {
        //     return;
        // }
        log.info(flags, car, closingSpeed, index);
    }
}
export default new HealthController();
