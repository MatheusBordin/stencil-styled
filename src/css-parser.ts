import * as stylis_ from 'stylis';

const stylis = stylis_;

export function css(strings: TemplateStringsArray, ...interpolations: string[]) {
    const css = strings.reduce((acc, item, idx) => acc + item + (interpolations[idx] || ''), '');
    const result = (stylis as any).default('', css);

    return result;
}