export default function reduceToEnum<T>(targetEnum: T, elements: (keyof T)[]) {
    return elements.reduce(
        (acc, val) => acc | (targetEnum[val as keyof T] as unknown as number),
        0,
    );
}
