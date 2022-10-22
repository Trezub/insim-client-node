export default function createAutoFailingPromise(
    timeout: number,
    reason: string,
) {
    let resolveFunction: () => void;
    const promise: Promise<void> & { resolve: () => void } = new Promise<void>(
        (resolve, reject) => {
            const timeoutHandle = setTimeout(
                () => reject(new Error(reason)),
                timeout,
            );
            resolveFunction = () => {
                clearTimeout(timeoutHandle);
                resolve();
            };
        },
    ) as any;
    promise.resolve = resolveFunction;
    return promise;
}
