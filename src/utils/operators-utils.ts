import { getDeepValue } from "./object-utils";

export const Operators = {
    get(key: string): string | number {
        return getDeepValue(this, key);
    },
    if<T>(key: string, condition: string | number, value: T, elsi?: T) {
        if (getDeepValue(this, key) === condition) {
            return value;
        }

        return elsi || null;
    },
    switch(key: string, conditions: {
        [k: string]: string | number
    }): string | number {
        const keyValue = getDeepValue(this, key);

        for (const [cond, value] of Object.entries(conditions)) {
            if (keyValue === cond) {
                return value;
            }
        }

        return null;
    }
}