import { SendMessageProps, UserType } from '../packets/SendMessage';

class MessageController {
    handleNewMessage({
        message,
        connectionId,
        playerId,
        playerName,
        userType,
    }: SendMessageProps) {
        if (userType === UserType.MSO_SYSTEM) {
            return;
        }
        console.log(`${playerName}: ${message}`);
    }
}
export default new MessageController();
