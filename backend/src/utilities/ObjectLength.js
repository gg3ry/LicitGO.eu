export default function ObjectLength(obj, min, max) {
    if (typeof max === 'undefined') {
        max = min;
    }
    const length = Object.keys(obj).length;
    if (length < min) {
        return -1;
    }
    if (length > max) {
        return 1;
    }
    return 0;
}
