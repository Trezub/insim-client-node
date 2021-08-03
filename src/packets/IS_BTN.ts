import { PacketType } from '../enums/PacketType';
import toByteArray from '../utils/toByteArray';

export interface ButtonProps {
    id: number;
    style?: ButtonStyle;
    typeIn?: number;
    left?: number;
    top?: number;
    height?: number;
    width?: number;
    text: string;
    requestId: number;
    connectionId: number;
    alwaysVisible?: boolean;
}

export enum ButtonStyle {
    ISB_C1 = 1, // you can choose a standard
    ISB_C2 = 2, // interface colour using
    ISB_C4 = 4, // these 3 lowest bits - see below
    ISB_CLICK = 8, // click this button to send IS_BTC
    ISB_LIGHT = 16, // light button
    ISB_DARK = 32, // dark button
    ISB_LEFT = 64, // align text to left
    ISB_RIGHT = 128, // align text to right
}

export default {
    fromProps({
        id,
        requestId,
        text,
        height,
        left,
        top,
        style,
        typeIn,
        width,
        connectionId,
        alwaysVisible,
    }: ButtonProps) {
        return Buffer.from([
            Math.ceil((Math.min(240, text.length) + 1) / 4) * 4 + 12,
            PacketType.ISP_BTN,
            requestId,
            connectionId,
            id,
            alwaysVisible ? 128 : 0,
            style,
            typeIn,
            left,
            top,
            width,
            height,
            ...toByteArray(
                text,
                Math.ceil((Math.min(240, text.length) + 1) / 4) * 4,
            ),
        ]);
    },
};
