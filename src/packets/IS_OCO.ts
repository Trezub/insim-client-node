import { PacketType } from '../enums/PacketType';

export enum ObjectControlLight {
    RED = 1,
    AMBER = 2,
    GREEN = 8,
}

export enum ObjectControlIndex {
    AXO_START_LIGHTS = 149, // overrides temporary start lights in the layout
    OCO_INDEX_MAIN = 240, // special value to override the main start light system
}

export interface ObjectControlProps {
    action: ObjectControlAction;
    mainLights?: ObjectControlIndex;
    id: number;
    lights: ObjectControlLight;
}

export enum ObjectControlAction {
    OCO_ZERO, // reserved
    OCO_1, //
    OCO_2, //
    OCO_3, //
    OCO_LIGHTS_RESET, // give up control of all lights
    OCO_LIGHTS_SET, // use Data byte to set the bulbs
    OCO_LIGHTS_UNSET, // give up control of the specified lights
    OCO_NUM,
}

export default {
    fromProps({ action, mainLights, id, lights }: ObjectControlProps) {
        return Buffer.from([
            8, // Size
            PacketType.ISP_OCO, // Type
            0, // ReqId
            0, // Zero
            action, // OCOAction
            mainLights || 149, // Index
            id, // Identifier
            lights, // Data
        ]);
    },
};
