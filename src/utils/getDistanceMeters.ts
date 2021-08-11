export interface Point {
    x: number;
    y: number;
}

export default function getDistanceMeters(a: Point, b: Point) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
