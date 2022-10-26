import inSimClient from '../inSimClient';
import playerController from './playerController';
import zones from '../zones';
import { UserControlAction, UserControlObjectsProps } from '../packets/IS_UCO';
import { CarStateChangedProps } from '../packets/IS_CSC';
import { lightBlue, lightGreen, white } from '../colors';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import streetCheckpoints from '../streets';
import log from '../log';

export class ZoneController {
    async handleUserControl(uco: UserControlObjectsProps) {
        const player = playerController.players.get(uco.playerId);
        if (process.env.NODE_ENV === 'development') {
            if (!player) {
                return;
            }
        }
        if (uco.object.id === 253) {
            // InSim Circle
            const zone = zones.find((z) => z.id === uco.object.heading);
            if (!zone) {
                return;
            }
            if (uco.action === UserControlAction.UCO_CIRCLE_ENTER) {
                player.zone = zone;
            } else if (uco.action === UserControlAction.UCO_CIRCLE_LEAVE) {
                player.zone = null;
            }
        } else if (uco.object.id === 252) {
            const { x, y } = uco.object.position;
            // InSim Checkpoint
            const streetCheckpoint = streetCheckpoints[inSimClient.track].find(
                (s) =>
                    s.x ===
                        (Math.round(Math.abs(x) * 100) / 100) *
                            (Math.sign(x) > 0 ? 1 : -1) &&
                    s.y ===
                        (Math.round(Math.abs(y) * 100) / 100) *
                            (Math.sign(y) > 0 ? 1 : -1),
            );
            if (!streetCheckpoint) {
                return;
            }
            if (uco.action === UserControlAction.UCO_CP_FWD) {
                player.street = streetCheckpoint.forward;
            } else if (uco.action === UserControlAction.UCO_CP_REV) {
                player.street = streetCheckpoint.backwards;
            }
        }
    }

    async handleCarStateChange(csc: CarStateChangedProps) {
        const player = playerController.players.get(csc.playerId);
        if (!player || !player.zone) {
            return;
        }
        if (!csc.stopped) {
            player.connection.gui.openWindow = null;
            return;
        }
        if (player.zone) {
            player.zone.handler?.(player);
            if (player.zone.texts) {
                await sendMessageToConnection(
                    `${lightBlue}| ${white}${player.zone.name}: ${lightGreen} ${
                        player.zone.texts[
                            Math.round(
                                Math.random() * (player.zone.texts.length - 1),
                            )
                        ]
                    }`,
                    player,
                );
            }
        }
    }
}

export default new ZoneController();
