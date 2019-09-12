class ThemeProvider {
    get theme() {
        return this.state;
    }

    public next(value: any) {
        this.state = value;

        for (const fn of this.listeners) {
            fn(this.state);
        }
    }

    public subscribe(fn) {
        this.listeners.push(fn);
    }

    public unsubscribe(fn) {
        const idx = this.listeners.indexOf(fn);

        if (idx != -1) {
            this.listeners.splice(idx, 1, 0);
        }
    }

    private listeners = [];
    private state: any = {};
}

export const themeProvider = new ThemeProvider();