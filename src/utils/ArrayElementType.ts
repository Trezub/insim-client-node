export type ArrayElementType<T extends ReadonlyArray<unknown>> =
    T extends ReadonlyArray<
        // eslint-disable-next-line @typescript-eslint/no-shadow
        infer ElementType
    >
        ? ElementType
        : never;
