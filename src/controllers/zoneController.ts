import { sendPacket } from '../app';
import {
    UserControlAction,
    UserControlObjectsProps,
} from '../packets/UserControlObject';
import * as MessageToConnection from '../packets/MessageToConnection';
import playerController from './playerController';
import { CarStateChangedProps } from '../packets/CarStateChanged';
import zones from '../zones';

export class ZoneController {
    async handleUserControl(uco: UserControlObjectsProps) {
        if (uco.object.id !== 253) {
            // InSim Circle
            return;
        }
        const zone = zones.find((z) => z.id === uco.object.heading);
        if (!zone) {
            return;
        }
        const player = playerController.players.get(uco.playerId);
        if (uco.action === UserControlAction.UCO_CIRCLE_ENTER) {
            player.zone = zone;
        } else {
            player.zone = null;
        }
    }

    async handleCarStateChange(csc: CarStateChangedProps) {
        const player = playerController.players.get(csc.playerId);
        if (!player) {
            return;
        }
        if (!csc.stopped) {
            return;
        }
        if (!player.zone) {
            return;
        }
        if (player.zone.handler) {
            player.zone.handler(player);
        }
        await sendPacket(
            MessageToConnection.fromProps({
                playerId: player.id,
                message: `${player.zone.name}: ${
                    player.zone.texts[
                        Math.round(
                            Math.random() * (player.zone.texts.length - 1),
                        )
                    ]
                }`,
                sound: MessageToConnection.MTCSound.SND_SYSMESSAGE,
            }),
        );
    }
}

export default new ZoneController();
