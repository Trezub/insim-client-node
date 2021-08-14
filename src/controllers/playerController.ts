import shuffle from 'lodash.shuffle';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import inSimClient from '../inSimClient';
import log from '../log';
import { ObjectInfoFlag } from '../packets/helpers/ObjectInfo';
import IS_JRR, { JRRAction } from '../packets/IS_JRR';
import { MulticarInfoProps } from '../packets/IS_MCI';
import { NewPlayerProps } from '../packets/IS_NPL';
import { PlayerLeaveProps } from '../packets/IS_PLL';
import Player from '../Player';
import spawnLocations from '../spawnLocations';
import bankController from './bankController';
import getDistanceMeters from '../utils/getDistanceMeters';
import connectionController from './connectionController';
import correiosController from './correiosController';

class PlayerController {
    players = new Map<Number, Player>();

    async handleNewPlayer(player: NewPlayerProps) {
        const connection = connectionController.connections.get(
            player.connectionId,
        );
        if (!connection) {
            return log.error(
                `Connection ${player.connectionId} not found for player ${player.nickname} (${player.playerId})`,
            );
        }

        if (player.isJoinRequest) {
            const locations = shuffle(spawnLocations[inSimClient.track]);
            const spawnLocation = locations.find(
                (l) =>
                    ![...this.players].some(
                        ([, p]) => getDistanceMeters(p.position, l) < 5,
                    ),
            );
            if (!spawnLocation) {
                await inSimClient.sendPacket(
                    IS_JRR.fromProps({
                        action: JRRAction.JRR_SPAWN,
                        connectionId: player.connectionId,
                    }),
                );
            }
            await inSimClient.sendPacket(
                IS_JRR.fromProps({
                    action: JRRAction.JRR_SPAWN,
                    connectionId: player.connectionId,
                    startPosition: {
                        flags: ObjectInfoFlag.SetStartPoint,
                        heading: spawnLocation.h,
                        position: {
                            x: spawnLocation.x,
                            y: spawnLocation.y,
                            z: 0,
                        },
                    },
                }),
            );
            return;
        }
        log.info(
            `${player.nickname} (${player.connectionId}) Joined race with car ${player.car}.`,
        );
        const newPlayer = new Player(player);
        connection.player = newPlayer;
        this.players.set(player.playerId, newPlayer);

        // await bankController.handlePlayerEntrance(newPlayer);
        if (player.nickname === 'Nenzie') {
            await correiosController.handlePlayerEntrance(newPlayer);
        }
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
