import { NewPlayerProps } from '../packets/NewPlayer';
import { PlayerLeaveProps } from '../packets/PlayerLeave';
import log from '../log';

class PlayerController {
    players = new Map<Number, NewPlayerProps>();

    handleNewPlayer(player: NewPlayerProps) {
        console.log(
            `${player.nickname} (${player.connectionId}) Joined race with car ${player.car}.`,
        );
        this.players.set(player.playerId, player);
    }

    handlePlayerLeave({ playerId }: PlayerLeaveProps) {
        const player = this.players.get(playerId);
        if (!player) {
            log.error(`Player ${playerId} not found.`);
        }
        log.info(`Player Left: ${player.nickname} (${player.playerId}).`);
        this.players.delete(playerId);
    }
}
export default new PlayerController();
