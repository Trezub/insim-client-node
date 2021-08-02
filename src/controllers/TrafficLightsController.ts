import { sendPacket } from '../app';
import * as ObjectControl from '../packets/ObjectControl';
import delay from '../utils/delay';

export default class TrafficLightsController {
    openPhase: number = 0;

    constructor(greenTime: number, ids: number[]) {
        sendPacket(
            ObjectControl.fromProps({
                id: ids[0],
                action: 5,
                lights: ObjectControl.ObjectControlLight.GREEN,
            }),
        );
        setInterval(async () => {
            await sendPacket(
                ObjectControl.fromProps({
                    id: ids[this.openPhase],
                    action: 5,
                    lights: ObjectControl.ObjectControlLight.AMBER,
                }),
            );
            await delay(3000);
            await sendPacket(
                ObjectControl.fromProps({
                    id: ids[this.openPhase],
                    action: 5,
                    lights: ObjectControl.ObjectControlLight.RED,
                }),
            );
            if (this.openPhase < ids.length) {
                this.openPhase += 1;
            } else {
                this.openPhase = 0;
            }
            await delay(3000);
            await sendPacket(
                ObjectControl.fromProps({
                    id: ids[this.openPhase],
                    action: 5,
                    lights: ObjectControl.ObjectControlLight.GREEN,
                }),
            );
        }, greenTime);
    }
}
