export default function toByteArray(str: string, size?: number) {
    const result = [];
    for (let i = 0; i < (size || str.length); i++) {
        if (i > str.length - 1 || i === size - 1) {
            result.push(0);
            continue;
        }
        result.push(str.charCodeAt(i));
    }
    return result;
}
