import { ArrayElementType } from '../utils/ArrayElementType';

const modes = [
    'normal',
    'options',
    'hostOptions',
    'garage',
    'carSelect',
    'trackSelect',
    'freeView',
] as const;

/** Submode identifiers for CIM_NORMAL */
export enum CIMNormalSubmodes {
    NRM_NORMAL,
    NRM_WHEEL_TEMPS, // F9
    NRM_WHEEL_DAMAGE, // F10
    NRM_LIVE_SETTINGS, // F11
    NRM_PIT_INSTRUCTIONS, // F12
}

/** SubMode identifiers for CIM_GARAGE */
export enum CIMGarageSubmodes {
    GRG_INFO,
    GRG_COLOURS,
    GRG_BRAKE_TC,
    GRG_SUSP,
    GRG_STEER,
    GRG_DRIVE,
    GRG_TYRES,
    GRG_AERO,
    GRG_PASS,
}

/** SubMode identifiers for CIM_SHIFTU */
export enum CIMFreeViewSubmodes {
    FVM_PLAIN, // no buttons displayed
    FVM_BUTTONS, // buttons displayed (not editing)
    FVM_EDIT, // edit mode
}

export interface ConnectionInterfaceProps {
    connectionId: number;
    mode: ArrayElementType<typeof modes>;
    subMode: CIMNormalSubmodes | CIMGarageSubmodes | CIMFreeViewSubmodes | null;
}

export default {
    fromBuffer(buffer: Buffer): ConnectionInterfaceProps {
        const [, , , connectionId, mode, subMode] = buffer;

        return {
            connectionId,
            mode: modes[mode],
            subMode,
        };
    },
};
