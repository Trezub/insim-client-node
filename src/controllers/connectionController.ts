import Connection from '../Connection';
import log from '../log';
import {
    ConnectionLeaveProps,
    ConnectionLeaveReason,
} from '../packets/ConnectionLeave';
import { NewConnectionProps } from '../packets/NewConnection';
import { NewConnectionInfoProps } from '../packets/NewConnectionInfo';
import { PlayerRenameProps } from '../packets/PlayerRename';

class ConnectionController {
    connections = new Map<number, Connection>();

    handleNewConnection(connection: NewConnectionProps) {
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
    }

    handleConnectionLeave({ connectionId, reason }: ConnectionLeaveProps) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            log.error(`Connection ${connectionId} not found.`);
        }
        log.info(
            `Connection left: ${connection.username} (${connection.id}). Reason: ${ConnectionLeaveReason[reason]}`,
        );
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

    handleConnectionInfo({
        connectionId,
        ipAddress,
        language,
        requestId,
        userId,
    }: NewConnectionInfoProps) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            log.error(`Connection ${connectionId} not found.`);
        }
        connection.ipAddress = ipAddress;
        connection.language = language;
        connection.userId = userId;
    }
}

export default new ConnectionController();
