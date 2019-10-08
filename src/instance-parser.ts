import { ThemeProvider } from "./theme";
import { Operators } from "./utils/operators-utils";
import { ComponentInterface } from "@stencil/core";

/**
 * Transform instance to props.
 *
 * @export
 * @param {*} instance
 * @returns
 */
export function instanceToProps(instance: ComponentInterface) {
    const result = {
        ...Operators,
        theme: ThemeProvider.theme
    };

    for (const key in instance) {
        result[key] = instance[key];
    }

    return result;
}