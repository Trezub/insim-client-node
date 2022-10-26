import { PacketType } from '../enums/PacketType';
import { ArrayElementType } from '../utils/ArrayElementType';
import ObjectInfo, { ObjectInfoProps } from './helpers/ObjectInfo';

const pmoActions = [
    'loadingFile', // 0 - sent by the layout loading system only
    'addObjects', // 1 - adding objects (from InSim or editor)
    'delObjects', // 2 - delete objects (from InSim or editor)
    'clearAll', // 3 - clear all objects (NumO must be zero)
    'TINY_AXM', // 4 - a reply to a TINY_AXM request
    'TTC_SEL', // 5 - a reply to a TTC_SEL request
    'setSelection', // 6 - set a connection's layout editor selection
    'position', // 7 - user pressed O without anything selected
    'getZ', // 8 - request Z values / reply with Z values
] as const;

const pmoFlags = [
    'fileEnd',
    'moveModify',
    'selectionReal',
    'avoidCheck',
] as const;

export interface AutoCrossObjectsProps {
    requestId: number;
    connectionId?: number;
    action: ArrayElementType<typeof pmoActions>;
    flags: {
        [key in ArrayElementType<typeof pmoFlags>]: boolean;
    };
    objects: ObjectInfoProps[];
}

export default {
    fromBuffer(buffer: Buffer): AutoCrossObjectsProps {
        const [, , requestId, objectCount, connectionId, pmoAction, flagsByte] =
            buffer;

        const flags = {} as AutoCrossObjectsProps['flags'];
        pmoFlags.forEach((flag, i) => {
            // eslint-disable-next-line no-bitwise
            flags[flag] = (flagsByte & (2 ** i)) > 0;
        });

        const objects: ObjectInfoProps[] = [];

        for (let i = 0; i < objectCount; i++) {
            objects.push(
                ObjectInfo.fromBuffer(buffer.slice(i * 8 + 8, i * 8 + 8 + 17)),
            );
        }

        return {
            connectionId,
            requestId,
            action: pmoActions[pmoAction],
            flags,
            objects,
        };
    },
    fromProps({
        action,
        flags,
        objects,
        connectionId,
    }: AutoCrossObjectsProps): Buffer {
        let flagsByte = 0;
        pmoFlags.forEach((flag, i) => {
            // eslint-disable-next-line no-bitwise
            flagsByte |= flags[flag] ? 2 ** i : 0;
        });
        const buffer = Buffer.from([
            (8 + 8 * objects.length) / 4,
            PacketType.ISP_AXM,
            0,
            objects.length,
            connectionId,
            pmoActions.findIndex((a) => a === action),
            flagsByte,
            0,
            ...Buffer.concat(
                objects.map((object) => ObjectInfo.fromProps(object)),
            ),
        ]);
        return buffer;
    },
};
