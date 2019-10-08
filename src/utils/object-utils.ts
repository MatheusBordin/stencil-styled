
/**
 * Get deep value of object.
 *
 * @export
 * @template T Object type.
 * @param {T} obj Object.
 * @param {string} path Key path.
 * @returns {*} Value.
 */
export function getDeepValue<T>(obj: T, path: string): any {
    const keyList = path.split('.');

    let key: string;
    let value = obj;
    while(key = keyList.shift()) {
        value = value[key];

        if (value == null) {
            break;
        }
    }

    return value || null;
}