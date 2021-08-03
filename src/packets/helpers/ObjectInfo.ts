export interface ObjectInfoProps {
    heading: number;
    position: { x: number; y: number; z: number };
    id: number;
}

export function fromBuffer(buffer: Buffer): ObjectInfoProps {
    const x = buffer.readInt16LE();
    const y = buffer.readInt16LE(1);
    const [z, , id, heading] = buffer.slice(3);

    return {
        heading,
        id,
        position: { x, y, z },
    };
}
