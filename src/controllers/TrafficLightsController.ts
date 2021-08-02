import { sendPacket } from '../app';
import IS_OCO, { ObjectControlLight } from '../packets/IS_OCO';
import delay from '../utils/delay';

export default class TrafficLightsController {
    openPhase: number = 0;

    constructor(greenTime: number, ids: number[]) {
        sendPacket(
            IS_OCO.fromProps({
                id: ids[0],
                action: 5,
                lights: ObjectControlLight.GREEN,
            }),
        );
        setInterval(async () => {
            await sendPacket(
                IS_OCO.fromProps({
                    id: ids[this.openPhase],
                    action: 5,
                    lights: ObjectControlLight.AMBER,
                }),
            );
            await delay(3000);
            await sendPacket(
                IS_OCO.fromProps({
                    id: ids[this.openPhase],
                    action: 5,
                    lights: ObjectControlLight.RED,
                }),
            );
            if (this.openPhase < ids.length) {
                this.openPhase += 1;
            } else {
                this.openPhase = 0;
            }
            await delay(3000);
            await sendPacket(
                IS_OCO.fromProps({
                    id: ids[this.openPhase],
                    action: 5,
                    lights: ObjectControlLight.GREEN,
                }),
            );
        }, greenTime);
    }
}
