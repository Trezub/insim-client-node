import shuffle from 'lodash.shuffle';
import { lightBlue, red } from '../colors';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import inSimClient from '../inSimClient';
import log from '../log';
import { ObjectInfoFlag } from '../packets/helpers/ObjectInfo';
import IS_JRR, { JRRAction } from '../packets/IS_JRR';
import { MulticarInfoProps } from '../packets/IS_MCI';
import IS_MST from '../packets/IS_MST';
import { NewPlayerProps } from '../packets/IS_NPL';
import { PlayerLeaveProps } from '../packets/IS_PLL';
import Player from '../Player';
import spawnLocations from '../spawnLocations';
import getCar from '../utils/getCar';
import getDistanceMeters from '../utils/getDistanceMeters';
import zones from '../zones';
import bankController from './bankController';
import connectionController from './connectionController';

class PlayerController {
    players = new Map<Number, Player>();

    async handleNewPlayer(player: NewPlayerProps) {
        const connection = connectionController.connections.get(
            player.connectionId,
        );

        if (!connection) {
            if (process.env.NODE_ENV !== 'development') {
                log.error(
                    `Connection ${player.connectionId} not found for player ${player.nickname} (${player.playerId})`,
                );
            }
            return;
        }

        await connection.connectionInfoPromise;

        const car = await getCar(player.car);
        const denyJoin = async () => {
            if (player.isJoinRequest) {
                await inSimClient.sendPacket(
                    IS_JRR.fromProps({
                        action: JRRAction.JRR_REJECT,
                        connectionId: player.connectionId,
                    }),
                );
            } else {
                await inSimClient.sendPacket(
                    IS_MST.fromProps(`/spec ${connection.username}`),
                );
            }
        };
        if (!car?.allowed && !connection.canUseAnyCar) {
            await Promise.all([
                denyJoin(),
                sendMessageToConnection(
                    `${lightBlue}| ${red}Este carro não está habilitado no servidor. (${
                        car?.name ?? 'Desconhecido'
                    })`,
                    connection,
                    'error',
                ),
            ]);
            return;
        }
        if (
            !connection.cars.some(({ id }) => car?.id === id) &&
            !connection.canUseAnyCar
        ) {
            await Promise.all([
                denyJoin(),
                sendMessageToConnection(
                    `${lightBlue}| ${red}Você não possui este carro. (${
                        car?.name ?? 'Desconhecido'
                    })`,
                    connection,
                    'error',
                ),
            ]);
            return;
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
            `${player.nickname} (${player.connectionId}) Joined race with car ${car?.name}.`,
        );
        const newPlayer = new Player({
            ...player,
            car,
        });
        connection.player = newPlayer;
        this.players.set(player.playerId, newPlayer);

        // newPlayer.location = zones.find((z) => z.id === 7);
        // bankController.handlePlayerEntrance(newPlayer);
        // correiosController.handlePlayerEntrance(newPlayer);
    }

    handlePlayerLeave({ playerId }: PlayerLeaveProps) {
        const player = this.players.get(playerId);
        if (!player) {
            return;
        }
        log.info(`Player Left: ${player.connection.nickname} (${player.id}).`);
        player.car = null;
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
