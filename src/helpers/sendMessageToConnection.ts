import Connection from '../Connection';
import inSimClient from '../inSimClient';
import IS_MTC, { MTCSound } from '../packets/IS_MTC';
import Player from '../Player';

type MessageSound = 'system' | 'none' | 'error';

export default async function sendMessageToConnection(
    message: string,
    target: Connection | Player,
    sound: MessageSound = 'none',
) {
    const sounds = {
        none: MTCSound.SND_SILENT,
        system: MTCSound.SND_SYSMESSAGE,
        error: MTCSound.SND_ERROR,
    };
    await inSimClient.sendPacket(
        IS_MTC.fromProps({
            message,
            connectionId: target instanceof Connection && target.id,
            playerId: target instanceof Player && target.id,
            sound: sounds[sound],
        }),
    );
}
