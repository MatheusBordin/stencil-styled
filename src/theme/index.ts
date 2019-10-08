import { ThemeSubject } from "./theme-subject";

export let ThemeProvider: ThemeSubject = null;
export const configureTheme = (theme) => {
    ThemeProvider = new ThemeSubject(theme);
}