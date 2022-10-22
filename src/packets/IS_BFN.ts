import { PacketType } from '../enums/PacketType';

export enum ButtonFunction {
    BFN_DEL_BTN, //  0 - instruction		: delete one button or range of buttons (must set ClickID)
    BFN_CLEAR, //  1 - instruction		: clear all buttons made by this insim instance
    BFN_USER_CLEAR, //  2 - info			: user cleared this insim instance's buttons
    BFN_REQUEST, //  3 - user request	: SHIFT+B or SHIFT+I - request for buttons
}

export interface ButtonFunctionProps {
    subType: ButtonFunction;
    connectionId: number;
    buttonId: number;
    buttonIdMax: number;
}

export default {
    fromBuffer(buffer: Buffer): ButtonFunctionProps {
        const [, , , subType, connectionId, buttonId, buttonIdMax] = buffer;
        return {
            subType,
            connectionId,
            buttonId,
            buttonIdMax,
        };
    },
    fromProps({
        buttonId,
        buttonIdMax,
        connectionId,
        subType,
    }: ButtonFunctionProps) {
        return Buffer.from([
            8 / 4,
            PacketType.ISP_BFN,
            0,
            subType,
            connectionId,
            buttonId,
            buttonIdMax,
            0,
        ]);
    },
};
