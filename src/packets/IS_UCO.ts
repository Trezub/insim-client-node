import * as CarContact from './helpers/CarContact';
import * as ObjectInfo from './helpers/ObjectInfo';

export enum UserControlAction {
    UCO_CIRCLE_ENTER, // entered a circle
    UCO_CIRCLE_LEAVE, // left a circle
    UCO_CP_FWD, // crossed cp in forward direction
    UCO_CP_REV, // crossed cp in reverse direction
}

export interface UserControlObjectsProps {
    playerId: number;
    action: UserControlAction;
    car: CarContact.CarContactProps;
    object: ObjectInfo.ObjectInfoProps;
}

export default {
    fromBuffer(buffer: Buffer) {
        const [, , , playerId, , action] = buffer;
        const car = CarContact.fromBuffer(buffer.slice(12, 21));
        const object = ObjectInfo.fromBuffer(buffer.slice(21));

        return {
            playerId,
            action,
            car,
            object,
        };
    },
};
