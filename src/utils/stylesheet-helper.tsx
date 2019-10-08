import { h } from "@stencil/core";
import { ComponentInterface } from "@stencil/core/dist/declarations";
import { getHostChildren } from "./host-helper";
import { instanceToProps } from "../instance-parser";

export function appendStyleToHost(node, targetName, cssText) {
    (getHostChildren(node) || []).push(
        <style type="text/css" constructible-style={ targetName }>{ cssText }</style>
    );
}

export function getOrCreateStylesheet(
    target: ComponentInterface,
    instance: ComponentInterface,
    property: string,
): CSSStyleSheet {
    const styleFactory = instance[property];
    const style = styleFactory(instanceToProps(instance));

    if (!instance.__plainStyle) {
        // First load of component.
        if (!target.__cachedPlainStyle) {
            // Has no cache.
            const styleSheet = new CSSStyleSheet() as any;
            styleSheet.replace(style);

            target.__cachedPlainStyle = style;
            target.__cachedStyleSheet = styleSheet;
            instance.__plainStyle = style;
            instance.__styleSheet = styleSheet;
        } else if (target.__cachedPlainStyle === style) {
            instance.__plainStyle = style;
            instance.__styleSheet = target.__cachedStyleSheet;
        } else {
            instance.__plainStyle = style;
            instance.__styleSheet = new CSSStyleSheet() as any;
            instance.__styleSheet.replace(style);
        }

        return instance.__styleSheet;
    } else if (instance.__plainStyle !== style) {
        if (instance.__styleSheet === target.__cachedStyleSheet) {
            instance.__styleSheet = new CSSStyleSheet();
            instance.__styleSheet.replace(style);
            instance.__plainStyle = style;

            return instance.__styleSheet;
        } else {
            instance.__plainStyle = style;
            instance.__styleSheet.replace(style);

            return null;
        }
    }

    return null;
}