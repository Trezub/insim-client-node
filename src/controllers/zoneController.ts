import inSimClient from '../inSimClient';
import playerController from './playerController';
import zones from '../zones';
import { UserControlAction, UserControlObjectsProps } from '../packets/IS_UCO';
import { CarStateChangedProps } from '../packets/IS_CSC';
import { lightBlue, lightGreen, white } from '../colors';
import sendMessageToConnection from '../helpers/sendMessageToConnection';
import streets, { isStreet } from '../streets';

export class ZoneController {
    async handleUserControl(uco: UserControlObjectsProps) {
        const player = playerController.players.get(uco.playerId);
        if (uco.object.id === 253) {
            // InSim Circle
            const zone = zones.find((z) => z.id === uco.object.heading);
            if (!zone) {
                return;
            }
            if (uco.action === UserControlAction.UCO_CIRCLE_ENTER) {
                player.location = zone;
            } else if (uco.action === UserControlAction.UCO_CIRCLE_LEAVE) {
                player.location = player.previousLocation;
            }
        } else if (uco.object.id === 252) {
            // InSim Checkpoint
            const streetCheckpoint = streets[inSimClient.track].find(
                (s) =>
                    s.x === uco.object.position.x &&
                    s.y === uco.object.position.y &&
                    s.z === uco.object.position.z,
            );
            if (!streetCheckpoint) {
                return;
            }
            if (uco.action === UserControlAction.UCO_CP_FWD) {
                player.location = streetCheckpoint.forward;
            } else if (uco.action === UserControlAction.UCO_CP_REV) {
                player.location = streetCheckpoint.backwards;
            }
        }
    }

    async handleCarStateChange(csc: CarStateChangedProps) {
        const player = playerController.players.get(csc.playerId);
        if (!player || !csc.stopped || !player.location) {
            return;
        }
        if (!isStreet(player.location)) {
            if (player.location.handler) {
                player.location.handler(player);
            }
            await sendMessageToConnection(
                `${lightBlue}| ${white}${player.location.name}: ${lightGreen} ${
                    player.location.texts[
                        Math.round(
                            Math.random() * (player.location.texts.length - 1),
                        )
                    ]
                }`,
                player,
            );
        }
    }
}

export default new ZoneController();
