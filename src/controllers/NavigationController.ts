import { readFileSync } from 'fs';
import Graph from 'node-dijkstra';
import Connection from '../Connection';
import { Point } from '../StreetEditor';
import getDistanceMeters from '../utils/getDistanceMeters';
import log from '../log';

const streets = JSON.parse(
    readFileSync('data/streets.json', 'utf-8') || '[]',
) as {
    id: string;
    name: string;
    points: Point[];
}[];

const route = new Graph();
streets.forEach((street) => {
    street.points.forEach((point, i) => {
        const neighbours = point.connections.map((connection) => [
            connection,
            getDistanceMeters(
                point,
                streets
                    .flatMap((s) => s.points)
                    .find((p) => p.id === connection),
            ),
        ]) as [string, number][];
        if (i > 0) {
            neighbours.push([
                street.points[i - 1].id,
                getDistanceMeters(point, street.points[i - 1]),
            ]);
        }
        if (street.points[i + 1]) {
            neighbours.push([
                street.points[i + 1].id,
                getDistanceMeters(point, street.points[i + 1]),
            ]);
        }
        route.addNode(point.id, new Map<string, number>(neighbours));
    });
});

log.debug('Navigation nodes processed.');

export class NavigationController {
    constructor(connection: Connection) {
        this.connection = connection;
    }

    connection: Connection;
}
