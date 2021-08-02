import log from '../log';
import { SendMessageProps } from '../packets/IS_MST';

class MessageController {
    handleNewMessage({
        message,
        connectionId,
        playerId,
        playerName,
        userType,
    }: SendMessageProps) {
        if (connectionId === 0) {
            return;
        }
        log.silly(`${playerName}: ${message}`);
    }
}
export default new MessageController();
