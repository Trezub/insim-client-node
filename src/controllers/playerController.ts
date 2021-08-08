import log from '../log';
import { MulticarInfoProps } from '../packets/IS_MCI';
import { NewPlayerProps } from '../packets/IS_NPL';
import { PlayerLeaveProps } from '../packets/IS_PLL';
import Player from '../Player';
import connectionController from './connectionController';

class PlayerController {
    players = new Map<Number, Player>();

    handleNewPlayer(player: NewPlayerProps) {
        log.info(
            `${player.nickname} (${player.connectionId}) Joined race with car ${player.car}.`,
        );
        const connection = connectionController.connections.get(
            player.connectionId,
        );
        if (!connection) {
            return log.error(
                `Connection ${player.connectionId} not found for player ${player.nickname} (${player.playerId})`,
            );
        }
        const newPlayer = new Player(player);
        connection.player = newPlayer;
        this.players.set(player.playerId, newPlayer);
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

    handleCarInfo({ cars }: MulticarInfoProps) {
        cars.forEach((car) => {
            const player = this.players.get(car.playerId);
            if (!player) {
                return;
            }
            player.speedKmh = car.speedKmh;
            player.position = car.position;
            player.heading = car.heading;
            player.direction = car.direction;
            // log.silly({ speed: car.speedKmh, position: car.position });
        });
    }
}
export default new PlayerController();
