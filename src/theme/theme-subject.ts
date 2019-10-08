import { Subject } from "./subject";
import { IThemeConstants } from "./type";

export class ThemeSubject extends Subject<IThemeConstants> {
    get theme() {
        return this._state;
    }
}