import constants from '../constants';
import { ButtonProps } from '../packets/IS_BTN';

export function centerY(
    btn: ButtonProps,
    offset?: { min: number; parentHeight: number },
): ButtonProps {
    const min = offset?.min ?? 0;
    const parentHeight = offset?.parentHeight ?? 200;

    return {
        ...btn,
        top: Math.max(
            Math.min(
                Math.round(min + parentHeight / 2 - btn.height / 2),
                constants.inSim.maxY,
            ),
            constants.inSim.minY,
        ),
    };
}

export function centerX(
    btn: ButtonProps,
    offset?: { min: number; parentWidth: number },
): ButtonProps {
    const min = offset?.min ?? 0;
    const parentWidth = offset?.parentWidth ?? 200;

    return {
        ...btn,
        left: Math.max(
            Math.min(
                Math.round(min + parentWidth / 2 - btn.width / 2),
                constants.inSim.maxX,
            ),
            constants.inSim.minX,
        ),
    };
}
