/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
import connectionController from '../controllers/connectionController';
import inSimClient from '../inSimClient';
import IS_BFN, { ButtonFunction } from '../packets/IS_BFN';
import { ButtonClickProps } from '../packets/IS_BTC';
import IS_BTN, { ButtonStyle } from '../packets/IS_BTN';

/* eslint-disable max-classes-per-file */
export interface UiComponentProps {
    style?: 'dark' | 'light';
    /** Default: `center` */
    align?: 'left' | 'right';
    /** Default: `false` */
    alwaysVisible?: boolean;

    text?: string;

    top: number;
    left: number;
    height: number;
    width: number;

    /** If greater than 0, allows to type a specified number of characters */
    typeInMax?: number;
    typeInDescription?: string;

    onClick?: (packet: ButtonClickProps) => any;

    children?: UiComponentProps[];

    isVirtual?: boolean;
    name?: string;
}

export type ProxiedUiComponent = Omit<UiComponentProps, 'children'> & {
    getChild(childName: string): ProxiedUiComponent;
    id: number;
    children: ProxiedUiComponent[];
    connectionId: number;
};

export function createComponent({
    props,
    connectionId,
}: {
    connectionId: number;
    props: UiComponentProps;
}): ProxiedUiComponent {
    const {
        children,
        height,
        left,
        style,
        top,
        width,
        align,
        alwaysVisible,
        onClick,
        text,
        typeInDescription: typeinDescription,
        typeInMax: typeIn,
    } = props;

    const connection = connectionController.connections.get(connectionId);

    let styleByte = 0;
    if (style) {
        styleByte = style === 'dark' ? ButtonStyle.DARK : ButtonStyle.LIGHT;
    }
    if (align) {
        styleByte |= align === 'left' ? ButtonStyle.LEFT : ButtonStyle.RIGHT;
    }

    // Reserves a id in this connection
    const id = connection.gui.getNextButtonId();

    if (onClick || typeIn) {
        styleByte |= ButtonStyle.CLICK;
        if (onClick) {
            connection.gui.clickHandlers.set(id, onClick);
        }
    }

    inSimClient.sendPacket(
        IS_BTN.fromProps({
            id,
            requestId: 1,
            connectionId,
            text,
            typeInDescription: typeinDescription,
            height,
            width,
            left,
            top,
            typeIn,
            style: styleByte,
            alwaysVisible,
        }),
    );

    const proxiedChildren = children?.map((child) =>
        createComponent({
            props: {
                ...child,
                // Calculates position relative to the parent
                top: top + child.top,
                left: left + child.left,
            },
            connectionId,
        }),
    );

    return new Proxy(
        {
            ...props,
            id,
            children: proxiedChildren,
            connectionId,
            getChild: (childName: string) =>
                proxiedChildren?.find((child) => child.name === childName),
        },
        {
            set(obj, prop, value) {
                // @ts-expect-error
                obj[prop] = value;

                // TODO: Send IS_BFN to delete buttons or create new buttons when the 'children' array changes

                // Updates the button when a attribute changes
                if (!['getChild', 'children'].includes(prop as string)) {
                    inSimClient.sendPacket(
                        IS_BTN.fromProps({
                            id,
                            requestId: 1, // Not used
                            connectionId,
                            text: obj.text,
                            height: obj.height,
                            width: obj.width,
                            left: obj.left,
                            top: obj.top,
                            typeIn: obj.typeInMax,
                            style: styleByte,
                            alwaysVisible: obj.alwaysVisible,
                        }),
                    );
                }

                return true;
            },
        },
    );
}

export function deleteComponent(component: ProxiedUiComponent) {
    const connection = connectionController.connections.get(
        component.connectionId,
    );
    connection.gui.buttonIds.delete(component.id);
    if (component.onClick) {
        connection.gui.clickHandlers.delete(component.id);
    }

    inSimClient.sendPacket(
        IS_BFN.fromProps({
            buttonId: component.id,
            buttonIdMax: component.id,
            connectionId: component.connectionId,
            subType: ButtonFunction.BFN_DEL_BTN,
        }),
    );

    component.children.forEach((child) => {
        connection.gui.buttonIds.delete(child.id);
        if (child.onClick) {
            connection.gui.clickHandlers.delete(child.id);
        }
        inSimClient.sendPacket(
            IS_BFN.fromProps({
                buttonId: child.id,
                buttonIdMax: child.id,
                connectionId: component.connectionId,
                subType: ButtonFunction.BFN_DEL_BTN,
            }),
        );
    });
}
