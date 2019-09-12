import { h } from "@stencil/core";
import { ComponentInterface } from "@stencil/core/dist/declarations";
import { getHostChildren } from "./host-helper";


export function appendStyleToHost(node, targetName, cssText) {
    (getHostChildren(node) || []).push(
        <style type="text/css" constructible-style={ targetName }>{ cssText }</style>
    );
}

export function getOrCreateStylesheet(
    instance: ComponentInterface,
    cacheProperty: string,
): CSSStyleSheet {
    const styleFactory = instance[cacheProperty];
    const style = styleFactory(instance);

    if (!instance.__oldStyleSheet || instance.__oldStyleSheet != style) {
        instance.__oldStyleSheet = style;

        if (instance.__curStyleSheet) {
            instance.__curStyleSheet.replace(style);
        } else {
            instance.__curStyleSheet = new CSSStyleSheet();
            instance.__curStyleSheet.replace(style);

            return instance.__curStyleSheet;
        }
    }

    return null;
}