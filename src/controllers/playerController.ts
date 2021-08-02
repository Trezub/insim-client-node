import { NewPlayerProps } from '../packets/NewPlayer';
import { PlayerLeaveProps } from '../packets/PlayerLeave';
import log from '../log';
import Player from '../Player';

class PlayerController {
    players = new Map<Number, Player>();

    handleNewPlayer(player: NewPlayerProps) {
        log.info(
            `${player.nickname} (${player.connectionId}) Joined race with car ${player.car}.`,
        );
        this.players.set(player.playerId, new Player(player));
    }

    handlePlayerLeave({ playerId }: PlayerLeaveProps) {
        const player = this.players.get(playerId);
        if (!player) {
            log.error(`Player ${playerId} not found.`);
            return;
            }
        log.info(`Player Left: ${player.connection.nickname} (${player.id}).`);
        this.players.delete(playerId);
    }
}
export default new PlayerController();
