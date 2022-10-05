import Connection from '../Connection';
import inSimClient from '../inSimClient';
import log from '../log';

import { ConnectionLeaveProps, ConnectionLeaveReason } from '../packets/IS_CNL';
import { PlayerRenameProps } from '../packets/IS_CPR';
import { NewConnectionInfoProps } from '../packets/IS_NCI';
import { NewConnectionProps } from '../packets/IS_NCN';
import IS_TINY, { TinyPacketSubType } from '../packets/IS_TINY';
import prisma from '../prisma';

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
        await prisma.user.upsert({
            create: {
                id: connection.userId,
                cars: connection.cars,
                cash: connection.cash,
                health: connection.health,
                language: connection.language,
                lastIPAddress: connection.ipAddress,
                username: connection.username,
            },
            update: {
                cars: connection.cars,
                cash: connection.cash,
                health: connection.health,
                language: connection.language,
                lastIPAddress: connection.ipAddress,
                username: connection.username,
            },
            where: {
                id: connection.userId,
            },
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
        userId,
    }: NewConnectionInfoProps) {
        // log.debug({ connectionId, ipAddress, language, requestId, userId });
        const connection = this.connections.get(connectionId);
        if (!connection) {
            log.error(`Connection ${connectionId} not found.`);
        }

        const user = await prisma.user.upsert({
            create: {
                id: connection.id,
                lastIPAddress: ipAddress,
                username: connection.username,
                bankCash: connection.bankCash,
                language,
            },
            update: {
                lastIPAddress: ipAddress,
                username: connection.username,
                bankCash: connection.bankCash,
                cars: connection.cars,
                cash: connection.cash,
                health: connection.health,
                language,
            },
            where: {
                id: connection.id,
            },
            select: {
                cars: true,
                health: true,
                bankCash: true,
                cash: true,
            },
        });

        connection.ipAddress = ipAddress;
        connection.language = language;
        connection.userId = userId;
        connection.cars = user.cars;
        connection.cash = user.cash;
        connection.health = user.health;
        connection.bankCash = user.bankCash;
    }
}

export default new ConnectionController();
