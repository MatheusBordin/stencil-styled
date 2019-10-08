import { IListener, IListenerDictionary } from "./type";

/**
 * Subject subscription.
 *
 * @export
 * @class Subscription
 * @template T
 */
export class Subscription<T> {
    constructor(
        private _listener: IListener<T>,
        private _instance: Subject<T>
    ) {
    }

    public unsubscribe() {
        this._instance.removeListener(this._listener);
    }
}

/**
 * Subject.
 *
 * @export
 * @abstract
 * @class Subject
 * @template T
 */
export abstract class Subject<T> {
    /**
     * The current subject state.
     *
     * @protected
     * @type {T}
     * @memberof Subject
     */
    protected _state: T;

    /**
     * Creates an instance of Subject.
     * 
     * @param {T} initialState
     * @memberof Subject
     */
    constructor(initialState: T) {
        this._state = this.parseState(initialState);
    }

    /**
     * Update statye.
     *
     * @param {Partial<T>} value
     * @memberof Subject
     */
    public next(value: Partial<T>) {
        this._state = this.parseState(value);

        for (const idx in this._listeners) {
            const fn = this._listeners[idx];
            fn(this._state);
        }
    }

    /**
     * Subscribe to receive updates of state.
     *
     * @param {IListener<T>} fn
     * @returns
     * @memberof Subject
     */
    public subscribe(fn: IListener<T>) {
        const idx = this._listenerIdx++;
        fn.__subscriptionId = idx;
        this._listeners[idx] = fn;

        return new Subscription(fn, this);
    }

    /**
     * Invalidate listener.
     *
     * @param {IListener<T>} listener
     * @memberof Subject
     */
    public removeListener(listener: IListener<T>) {
        const idx = listener.__subscriptionId;

        delete this._listeners[idx];
    }

    /**
     * Parse state.
     *
     * @protected
     * @param {Partial<T>} next
     * @returns {T}
     * @memberof Subject
     */
    protected parseState(next: Partial<T>): T {
        return Object.assign({}, this._state, next);
    }

    /**
     * Listeners dictionary.
     * Use dictionary to improve remove listener performance.
     *
     * @private
     * @type {IListenerDictionary<T>}
     * @memberof Subject
     */
    private _listeners: IListenerDictionary<T> = {};
    /**
     * Listener id in dictionary.
     *
     * @private
     * @memberof Subject
     */
    private _listenerIdx = 0;
}