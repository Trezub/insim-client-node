import log from '../log';
import { ObjectInfoProps } from '../packets/helpers/ObjectInfo';
import { AutoCrossObjectsProps } from '../packets/IS_AXM';
import connectionController from './connectionController';

export class AutocrossController {
    handleAxm({ action, flags, objects, connectionId }: AutoCrossObjectsProps) {
        if (action === 'TINY_AXM') {
            this.objects.push(...objects);
            if (flags.fileEnd) {
                log.debug(`${this.objects.length} objects loaded.`);
            }
        }
        if (action === 'position') {
            if (
                process.env.NODE_ENV !== 'development' ||
                !process.env.ENABLE_STREET_EDITOR
            ) {
                return;
            }
            const connection =
                connectionController.connections.get(connectionId);
            connection?.streetEditor?.handlePosition(objects[0]);
        }
    }

    objects: ObjectInfoProps[] = [];

    pathfinder: any;
}

export default new AutocrossController();
