export enum ClickFlag {
    ISB_LMB = 1, // left click
    ISB_RMB = 2, // right click
    ISB_CTRL = 4, // ctrl + click
    ISB_SHIFT = 8, // shift + click
}

export interface ButtonClickProps {
    requestId: number;
    connectionId: number;
    buttonId: number;
    clickFlags: ClickFlag;
}

export default {
    fromBuffer(buffer: Buffer): ButtonClickProps {
        const [, , requestId, connectionId, buttonId, , clickFlags] = buffer;
        return {
            requestId,
            connectionId,
            buttonId,
            clickFlags,
        };
    },
};
