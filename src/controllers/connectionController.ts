import { getRepository } from 'typeorm';
import Connection from '../Connection';
import { User } from '../database/models/User';
import { PlayerCar } from '../enums/PlayerCar';
import inSimClient from '../inSimClient';
import log from '../log';

import { ConnectionLeaveProps, ConnectionLeaveReason } from '../packets/IS_CNL';
import { PlayerRenameProps } from '../packets/IS_CPR';
import { NewConnectionInfoProps } from '../packets/IS_NCI';
import { NewConnectionProps } from '../packets/IS_NCN';
import IS_PLC from '../packets/IS_PLC';
import IS_TINY, { TinyPacketSubType } from '../packets/IS_TINY';
import bankController from './bankController';

class ConnectionController {
    connections = new Map<number, Connection>();

    async handleNewConnection(connection: NewConnectionProps) {
        if (connection.connectionId === 0) {
            // 0 is host
            return;
        }
        log.info(
            `${connection.username} connected. (${connection.connectionId})`,
        );
        this.connections.set(
            connection.connectionId,
            new Connection(connection),
        );
        if (connection.requestId !== 255) {
            await inSimClient.sendPacket(
                IS_TINY.fromProps({
                    requestId: 255,
                    subType: TinyPacketSubType.TINY_NCI,
                }),
            );
        }
        // await inSimClient.sendPacket(
        //     IS_PLC.fromProps({
        //         connectionId: connection.connectionId,
        //         cars: PlayerCar.RAC | PlayerCar.FZ5,
        //     }),
        // );
    }

    async handleConnectionLeave({
        connectionId,
        reason,
    }: ConnectionLeaveProps) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            log.error(`Connection ${connectionId} not found.`);
        }
        log.info(
            `Connection left: ${connection.username} (${connection.id}). Reason: ${ConnectionLeaveReason[reason]}`,
        );
        const userRepository = getRepository(User);
        await userRepository.save({
            id: connection.userId,
            cars: connection.cars,
            cash: connection.cash,
            health: connection.health,
            language: connection.language,
            lastIPAddress: connection.ipAddress,
            username: connection.username,
        });
        this.connections.delete(connectionId);
    }

    handlePlayerRename({ connectionId, nickname }: PlayerRenameProps) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            log.error(`Connection ${connectionId} not found.`);
            return;
        }
        log.info(
            `Connection ${connection.username} (${connectionId}) changed nickname to ${nickname}`,
        );
        connection.nickname = nickname;
    }

    async handleConnectionInfo({
        connectionId,
        ipAddress,
        language,
        requestId,
        userId,
    }: NewConnectionInfoProps) {
        // log.debug({ connectionId, ipAddress, language, requestId, userId });
        const connection = this.connections.get(connectionId);
        if (!connection) {
            log.error(`Connection ${connectionId} not found.`);
        }
        const userRepository = getRepository(User);

        let user =
            (await userRepository.findOne(userId)) ||
            userRepository.create({
                id: userId,
            });

        const { username } = connection;
        user.lastIPAddress = ipAddress;
        user.username = username;
        user.language = language;

        user = await userRepository.save(user);

        connection.ipAddress = ipAddress;
        connection.language = language;
        connection.userId = userId;
        connection.cars = user.cars;
        connection.cash = user.cash;
        connection.health = user.health;
        connection.bankCash = user.bankCash;

        if (connection.username === 'trezub') {
            await bankController.handlePlayerEntrance(connection.player);
        }
    }
}

export default new ConnectionController();
