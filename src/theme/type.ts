
/**
 * Listener signature.
 *
 * @export
 * @interface IListener
 * @template T
 */
export interface IListener<T> {
    (value: T): void;

    __subscriptionId?: number;
}

/**
 * Listener dictionary.
 *
 * @export
 * @interface IListenerHub
 * @template T
 */
export interface IListenerDictionary<T> {
    [key: number]: IListener<T>;
}

/**
 * Theme constants.
 *
 * @export
 * @interface IThemeConstants
 */
export interface IThemeConstants {
    [key: string]: string | number | Function | IThemeConstants;
}

export type ThemeValue = string | number | null;
export type StyledParams<T, K = IThemeConstants> = T & {
    get(key: string): ThemeValue;
    if(key: string, condition: ThemeValue, value: ThemeValue, elsi?: ThemeValue): ThemeValue;
    switch(key: string, conditions: {
        [k: string]: ThemeValue
    }): ThemeValue;
    theme: K;
}