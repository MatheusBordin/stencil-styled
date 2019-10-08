import Stylis from '@emotion/stylis';
import { IThemeConstants } from './theme/type';

const stylis = new Stylis();

export function css(strings: TemplateStringsArray, ...interpolations: (string | number | IThemeConstants)[]) {
    const css = strings.reduce((acc, item, idx) => acc + item + (interpolations[idx] || ''), '');
    const result = stylis('', css);

    return result;
}