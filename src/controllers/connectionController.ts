import log from '../log';
import {
    ConnectionLeaveProps,
    ConnectionLeaveReason,
} from '../packets/ConnectionLeave';
import { NewConnectionProps } from '../packets/NewConnection';

class ConnectionController {
    connections = new Map<number, NewConnectionProps>();

    handleNewConnection(connection: NewConnectionProps) {
        if (connection.connectionId === 0) {
            // 0 is host
            return;
        }
        log.info(
            `${connection.username} connected. (${connection.connectionId})`,
        );
        this.connections.set(connection.connectionId, connection);
    }

    handleConnectionLeave({ connectionId, reason }: ConnectionLeaveProps) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            log.error(`Connection ${connectionId} not found.`);
        }
        log.info(
            `Connection left: ${connection.username} (${connection.connectionId}). Reason: ${ConnectionLeaveReason[reason]}`,
        );
        this.connections.delete(connectionId);
    }
}

export default new ConnectionController();
