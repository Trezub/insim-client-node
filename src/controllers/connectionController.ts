import Connection from '../Connection';
import inSimClient from '../inSimClient';
import log from '../log';
import {
    CIMFreeViewSubmodes,
    ConnectionInterfaceProps,
} from '../packets/IS_CIM';

import { ConnectionLeaveProps, ConnectionLeaveReason } from '../packets/IS_CNL';
import { PlayerRenameProps } from '../packets/IS_CPR';
import { NewConnectionInfoProps } from '../packets/IS_NCI';
import { NewConnectionProps } from '../packets/IS_NCN';
import IS_TINY, { TinyPacketSubType } from '../packets/IS_TINY';
import prisma from '../prisma';

class ConnectionController {
    connections = new Map<number, Connection>();

    async handleNewConnection(connection: NewConnectionProps) {
        if (
            process.env.NODE_ENV === 'development' &&
            process.env.DEV_USERNAME &&
            connection.username !== process.env.DEV_USERNAME
        ) {
            return;
        }
        if (connection.connectionId === 0) {
            return; // 0 is host
        }
        log.info(
            `${connection.username} connected. (${connection.connectionId})`,
        );
        const newConnection = new Connection(connection);
        this.connections.set(connection.connectionId, newConnection);
        newConnection.gui.createHud();
        if (connection.requestId !== 255) {
            await inSimClient.sendPacket(
                IS_TINY.fromProps({
                    requestId: 255,
                    subType: TinyPacketSubType.TINY_NCI,
                }),
            );
        }
    }

    handleCIM({ connectionId, mode, subMode }: ConnectionInterfaceProps) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            return;
        }
        connection.streetEditor?.setVisible(
            mode === 'freeView' && subMode === CIMFreeViewSubmodes.FVM_EDIT,
        );
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
                cars: {
                    connect: connection.cars.map((car) => ({ id: car.id })),
                },
                cash: connection.cash,
                health: connection.health,
                language: connection.language,
                lastIPAddress: connection.ipAddress,
                username: connection.username,
                bankCash: connection.bankCash,
            },
            update: {
                cars: {
                    set: connection.cars.map((car) => ({ id: car.id })),
                },
                cash: connection.cash,
                health: connection.health,
                bankCash: connection.bankCash,
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
        const connection = this.connections.get(connectionId);
        if (!connection) {
            if (process.env.NODE_ENV !== 'development') {
                log.error(`Connection ${connectionId} not found.`);
            }
            return;
        }

        connection.ipAddress = ipAddress;
        connection.language = language;
        connection.userId = userId;

        const user = await prisma.user.upsert({
            create: {
                id: userId,
                lastIPAddress: ipAddress,
                username: connection.username,
                language,
                cars: {
                    connect: {
                        name: 'UF1',
                    },
                },
            },
            update: {
                lastIPAddress: ipAddress,
                username: connection.username,
                language,
            },
            where: {
                id: userId,
            },
            select: {
                cars: true,
                health: true,
                bankCash: true,
                cash: true,
                canUseAnyCar: true,
            },
        });

        connection.cash = user.cash;
        connection.cars = user.cars;
        connection.bankCash = user.bankCash;
        connection.health = user.health;
        connection.canUseAnyCar = user.canUseAnyCar;
        connection.connectionInfoPromise.resolve();
    }
}

export default new ConnectionController();
