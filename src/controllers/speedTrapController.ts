import log from '../log';
import {
    UserControlAction,
    UserControlObjectsProps,
} from '../packets/UserControlObject';

class SpeedTrapController {
    handleUserControl({
        action,
        object,
        car,
        playerId,
    }: UserControlObjectsProps) {
        if (object.id !== 252) {
            // 252 checkpoint
            return;
        }
        log.info(`Player ${playerId} passed checkpoint.`, {
            position: object.position,
            action: UserControlAction[action],
            speed: car.speedKmh,
        });
    }
}

export default new SpeedTrapController();
