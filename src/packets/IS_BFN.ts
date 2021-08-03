export interface ButtonFunctionProps {
    requestId: number;
    subType: ButtonFunction;
    connectionId: number;
    buttonId: number;
    clickMax: number;
}

export enum ButtonFunction {
    BFN_DEL_BTN, //  0 - instruction		: delete one button or range of buttons (must set ClickID)
    BFN_CLEAR, //  1 - instruction		: clear all buttons made by this insim instance
    BFN_USER_CLEAR, //  2 - info			: user cleared this insim instance's buttons
    BFN_REQUEST, //  3 - user request	: SHIFT+B or SHIFT+I - request for buttons
}

export default {
    fromBuffer(buffer: Buffer): ButtonFunctionProps {
        const [, , requestId, subType, connectionId, buttonId, clickMax] =
            buffer;
        return {
            requestId,
            subType,
            connectionId,
            buttonId,
            clickMax,
        };
    },
};
