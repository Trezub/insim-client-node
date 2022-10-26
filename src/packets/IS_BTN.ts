import { PacketType } from '../enums/PacketType';
import log from '../log';
import toByteArray from '../utils/toByteArray';

export enum ButtonStyle {
    TITLE = 1,
    UNSELECTED = 2,
    SELECTED = 3,
    OK = 4,
    CANCEL = 5,
    TEXT = 6,
    UNAVAILABLE = 7,
    CLICK = 8, // click this button to send IS_BTC
    LIGHT = 16, // light button
    DARK = 32, // dark button
    LEFT = 64, // align text to left
    RIGHT = 128, // align text to right
}

export interface ButtonProps {
    id: number;
    style?: ButtonStyle;
    typeIn?: number;
    left?: number;
    top?: number;
    height?: number;
    width?: number;
    text?: string;
    requestId: number;
    connectionId: number;
    alwaysVisible?: boolean;
    typeInDescription?: string;
}

export default {
    fromProps(props: ButtonProps) {
        const {
            id,
            requestId,
            text: buttonText,
            height,
            left,
            top,
            style,
            typeIn,
            width,
            connectionId,
            alwaysVisible,
            typeInDescription,
        } = props;
        const str = buttonText ?? '';
        const textLength = Math.min(
            240,
            str.length +
                (typeInDescription ? typeInDescription.length + 2 : 0) +
                1,
        );
        const text = typeInDescription ? `\0${typeInDescription}\0${str}` : str;
        if (text.length > 240) {
            log.warn(`Button text bigger than 240 characters: ${text}`);
        }
        const roundedTextLength = Math.ceil(textLength / 4) * 4;
        return Buffer.from([
            (roundedTextLength + 12) / 4, // Fixed size + variable text length (multiple of 4)
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
            ...toByteArray(text, roundedTextLength),
        ]);
    },
};
