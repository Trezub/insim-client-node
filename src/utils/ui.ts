/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
import connectionController from '../controllers/connectionController';
import inSimClient from '../inSimClient';
import log from '../log';
import IS_BFN, { ButtonFunction } from '../packets/IS_BFN';
import { ButtonClickProps } from '../packets/IS_BTC';
import IS_BTN, { ButtonStyle } from '../packets/IS_BTN';
import { ButtonTypeProps } from '../packets/IS_BTT';

export type Side = 'left' | 'right' | 'top' | 'bottom';
export type Direction = 'vertical' | 'horizontal';

/* eslint-disable max-classes-per-file */
export interface UiComponentProps {
    style?: 'dark' | 'light';
    /** Default: `center` */
    align?: 'left' | 'right';
    /** Default: `false` */
    alwaysVisible?: boolean;

    text?: string;

    top?: number;
    left?: number;
    height: number;
    width: number;
    flow?: Side;
    stickTo?: [Side, Side];
    centerSelf?: [Direction, Direction] | [Direction];

    /** If greater than 0, allows to type a specified number of characters */
    typeInMax?: number;
    typeInDescription?: string;
    initTypeInWithText?: boolean;
    onType?: (
        this: ProxiedUiComponent,
        component: ProxiedUiComponent,
        packet: ButtonTypeProps,
    ) => any;
    onClick?: (
        this: ProxiedUiComponent,
        component: ProxiedUiComponent,
        packet: ButtonClickProps,
    ) => any;

    children?: UiComponentProps[];

    isVirtual?: boolean;
    name?: string;

    state?: any;
}

export type ProxiedUiComponent = Omit<UiComponentProps, 'children'> & {
    getChild(childName: string): ProxiedUiComponent;
    id: number;
    children: ProxiedUiComponent[];
    connectionId: number;
    parent?: ProxiedUiComponent;
    state: any;
};

function getChildRecursive(
    name: string,
    components: ProxiedUiComponent[],
): ProxiedUiComponent | null {
    if (!components) {
        return null;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const component of components) {
        if (component.name === name) {
            return component;
        }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const component of components) {
        const found = getChildRecursive(name, component.children);
        if (found) {
            return found;
        }
    }
    return null;
}

function getTypeInByte({
    typeInMax,
    initTypeInWithText,
}: {
    typeInMax?: number;
    initTypeInWithText?: boolean;
}) {
    let typeInByte = typeInMax;
    // Init typein modal with the button's text
    if (typeInByte && initTypeInWithText) {
        typeInByte |= 128;
    }
    return typeInByte || 0;
}

function getStyleByte({
    style,
    align,
    onClick,
    typeInByte,
}: Pick<UiComponentProps, 'style' | 'align' | 'onClick'> & {
    typeInByte: number;
}) {
    let styleByte = 0;
    // Set button as clickable if a onClick handler is passed or its a typeIn
    if (style) {
        styleByte = style === 'dark' ? ButtonStyle.DARK : ButtonStyle.LIGHT;
    }
    if (align) {
        styleByte |= align === 'left' ? ButtonStyle.LEFT : ButtonStyle.RIGHT;
    }
    if (onClick || typeInByte) {
        styleByte |= ButtonStyle.CLICK;
    }
    return styleByte;
}

export function createComponent({
    props,
    connectionId,
    topLevel,
}: {
    connectionId: number;
    props: UiComponentProps;
    topLevel?: boolean;
}): ProxiedUiComponent {
    const {
        children,
        height,
        style,
        width,
        align,
        alwaysVisible,
        onClick,
        text,
        typeInDescription,
        isVirtual,
        onType,
        initTypeInWithText,
        flow,
        stickTo,
        typeInMax,
        centerSelf: selfCenter,
    } = props;

    let left = props.left ?? 0;
    let top = props.top ?? 0;

    const connection = connectionController.connections.get(connectionId);

    // Reserves a id in this connection
    const id = isVirtual ? null : connection.gui.getNextButtonId();

    const typeInByte = getTypeInByte({ initTypeInWithText, typeInMax });
    const styleByte = getStyleByte({ onClick, typeInByte, align, style });

    // Top level component
    if (topLevel !== false) {
        if (stickTo?.includes('bottom')) {
            top = 200 - height + top;
        }
        if (stickTo?.includes('right')) {
            left = 200 - width + left;
        }
        if (selfCenter?.includes('horizontal')) {
            left += Math.round(100 - width / 2);
        }
        if (selfCenter?.includes('vertical')) {
            top += Math.round(100 - height / 2);
        }
    }

    // Doesn't send a button packet if its a virtual component
    if (!isVirtual) {
        // TODO: Send a single packet with
        inSimClient.sendPacket(
            IS_BTN.fromProps({
                id,
                requestId: 1,
                connectionId,
                text,
                typeInDescription,
                height,
                width,
                left,
                top,
                typeIn: typeInByte,
                style: styleByte,
                alwaysVisible,
            }),
        );
    }

    const proxiedChildren = children?.filter(Boolean).map((child, index) => {
        child.left = child.left ?? 0;
        child.top = child.top ?? 0;

        if (child.stickTo?.includes('bottom')) {
            child.top = height - child.height + child.top;
        }
        if (child.stickTo?.includes('right')) {
            child.left = width - child.width + child.left;
        }
        if (flow) {
            const previousChild = children[index - 1];

            if (!child.stickTo) {
                if (flow === 'top') {
                    child.top +=
                        (previousChild?.top ?? 0) - child.height + child.top;
                    if (index === 0) {
                        child.top += height;
                    }
                    // child.left = previousChild?.left ?? child.left;
                }
                if (flow === 'left') {
                    child.left += (previousChild?.left ?? 0) - child.width;
                    if (index === 0) {
                        child.left += width;
                    }
                    // child.top = previousChild?.top ?? child.top;
                }
                if (flow === 'right') {
                    child.left +=
                        (previousChild?.left ?? 0) +
                        (previousChild?.width ?? 0);
                    // child.top = previousChild?.top ?? child.top;
                }
                if (flow === 'bottom') {
                    child.top +=
                        (previousChild?.top ?? 0) +
                        (previousChild?.height ?? 0);
                    // child.left = previousChild?.left ?? child.left;
                }
            }
        }

        if (child.centerSelf?.includes('horizontal')) {
            child.left += Math.round(width / 2 - child.width / 2);
        }
        if (child.centerSelf?.includes('vertical')) {
            child.top += Math.round(height / 2 - child.height / 2);
        }

        return createComponent({
            props: {
                ...child,
                // Calculates position relative to the parent
                top: top + child.top,
                left: left + child.left,
            },
            connectionId,
            topLevel: false,
        });
    });

    const proxy = new Proxy(
        {
            ...props,
            state: props.state ?? {},
            id,
            children: proxiedChildren,
            connectionId,
            getChild: (childName: string) =>
                getChildRecursive(childName, proxiedChildren),
        } as ProxiedUiComponent,
        {
            set(obj, prop, value) {
                // @ts-expect-error
                const oldValue = obj[prop];
                // @ts-expect-error
                obj[prop] = value;

                // TODO: Send IS_BFN to delete buttons or create new buttons when the 'children' array changes

                // Updates the button when a attribute changes
                if (
                    !['getChild', 'children', 'parent', 'state'].includes(
                        prop as string,
                    )
                ) {
                    if (prop === 'height' || prop === 'width') {
                        children.forEach((child) => {
                            child[prop] += obj[prop] - oldValue;
                        });
                    }
                    if (!isVirtual) {
                        if (prop === 'onType') {
                            if (!value) {
                                connection.gui.typeHandlers.delete(obj.id);
                            } else {
                                connection.gui.typeHandlers.set(obj.id, value);
                            }
                        }
                        if (prop === 'onClick') {
                            if (!value) {
                                connection.gui.clickHandlers.delete(obj.id);
                            } else {
                                connection.gui.clickHandlers.set(obj.id, value);
                            }
                        }

                        const newTypeInByte = getTypeInByte({
                            initTypeInWithText: obj.initTypeInWithText,
                            typeInMax: obj.typeInMax,
                        });

                        inSimClient.sendPacket(
                            Buffer.from([
                                ...(prop !== 'text'
                                    ? IS_BFN.fromProps({
                                          connectionId,
                                          buttonId: obj.id,
                                          buttonIdMax: obj.id,
                                          subType: ButtonFunction.BFN_DEL_BTN,
                                      })
                                    : []),
                                ...IS_BTN.fromProps({
                                    id,
                                    requestId: 1, // Not used
                                    connectionId,
                                    text: obj.text,
                                    height: obj.height,
                                    width: obj.width,
                                    left: obj.left,
                                    top: obj.top,
                                    typeIn: newTypeInByte,
                                    style: getStyleByte({
                                        typeInByte: newTypeInByte,
                                        align: obj.align,
                                        onClick: obj.onClick,
                                        style: obj.style,
                                    }),
                                    alwaysVisible: obj.alwaysVisible,
                                    typeInDescription: obj.typeInDescription,
                                }),
                            ]),
                        );
                    }
                }

                return true;
            },
        },
    );
    proxiedChildren?.forEach((child) => {
        child.parent = proxy;
    });
    if (onType && typeInByte) {
        connection.gui.typeHandlers.set(id, onType.bind(proxy, proxy));
    }

    if (onClick) {
        connection.gui.clickHandlers.set(id, onClick.bind(proxy, proxy));
    }

    return proxy;
}

export function deleteComponent(component: ProxiedUiComponent) {
    if (!component) {
        return;
    }
    const connection = connectionController.connections.get(
        component.connectionId,
    );
    if (!component.isVirtual) {
        connection.gui.buttonIds.delete(component.id);
        inSimClient.sendPacket(
            IS_BFN.fromProps({
                buttonId: component.id,
                buttonIdMax: component.id,
                connectionId: component.connectionId,
                subType: ButtonFunction.BFN_DEL_BTN,
            }),
        );
    }
    if (component.onClick) {
        connection.gui.clickHandlers.delete(component.id);
    }

    if (component.onType && component.typeInMax) {
        connection.gui.typeHandlers.delete(component.id);
    }

    component.children?.forEach(deleteComponent);
}
