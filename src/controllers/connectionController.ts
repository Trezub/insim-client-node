import { NewConnectionProps } from '../packets/NewConnection';

class ConnectionController {
    connections = new Map<number, NewConnectionProps>();

    handleNewConnection(connection: NewConnectionProps) {
        console.log(
            `${connection.username} connected. (${connection.connectionId})`,
        );
        this.connections.set(connection.connectionId, connection);
    }
}

export default new ConnectionController();
