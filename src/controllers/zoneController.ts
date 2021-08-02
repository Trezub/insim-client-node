import { sendPacket } from '../app';
import playerController from './playerController';
import zones from '../zones';
import { UserControlAction, UserControlObjectsProps } from '../packets/IS_UCO';
import { CarStateChangedProps } from '../packets/IS_CSC';
import IS_MTC, { MTCSound } from '../packets/IS_MTC';

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
            IS_MTC.fromProps({
                playerId: player.id,
                message: `${player.zone.name}: ${
                    player.zone.texts[
                        Math.round(
                            Math.random() * (player.zone.texts.length - 1),
                        )
                    ]
                }`,
                sound: MTCSound.SND_SYSMESSAGE,
            }),
        );
    }
}

export default new ZoneController();
