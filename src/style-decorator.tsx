import { h, Host, getElement } from "@stencil/core";
import { VNode, ComponentInterface } from "@stencil/core/dist/declarations";
import { ConstructibleStyleDecorator } from "./types/constructible-style-decorator";
import { supportsConstructibleStylesheets } from "./utils/support-helper";
import { getOrCreateStylesheet, appendStyleToHost } from "./utils/stylesheet-helper";
import { isHost } from "./utils/host-helper";
import { themeProvider } from "./theme/theme-provider";

/**
 * Decorator for dinamicaly add and update stylesheet's.
 *
 * @export
 * @returns {ConstructibleStyleDecorator}
 */
export function Styled(): ConstructibleStyleDecorator {
  return (target: ComponentInterface, propertyKey: string) => {
    const originalWillLoad = target.componentWillLoad;
    const originalWillUpdate = target.componentWillUpdate;
    const originalConnected = target.connectedCallback;
    const originalDisconnected = target.disconnectedCallback;
    const originalRender = target.render;

    if (!originalWillLoad) {
      console.warn(`ConstructibleStyle requires you to have a \`componentWillLoad\` lifecycle method in \`${ target.constructor.name }\`. Failure to add this function may cause ConstructibleStyle to fail due to StencilJS build optimizations.`);
    }

    if (!originalWillUpdate) {
      console.warn(`ConstructibleStyle requires you to have a \`componentWillLoad\` lifecycle method in \`${ target.constructor.name }\`. Failure to add this function may cause ConstructibleStyle to fail due to StencilJS build optimizations.`);
    }

    /**
     * Update style sheet object.
     *
     * @returns
     */
    function styleSheetCreator(originalFunction) {
      const host = getElement(this);
      const root = (host.shadowRoot || host) as any;
      const originalResult = originalFunction && originalFunction.call(this);

      // TODO: Remove old style after insert newest.
      const newStyleSheet = getOrCreateStylesheet(this, propertyKey);
      if (newStyleSheet != null) {
        root.adoptedStyleSheets = [
          ...(root.adoptedStyleSheets || []), 
          newStyleSheet
        ];
      }

      return originalResult;
    }

    /**
     * Render with style sheet element.
     *
     * @returns
     */
    function styleSheetRenderer() {
      const cssText = this[propertyKey]();
      let renderedNode: VNode = originalRender.call(this);

      if (!isHost(renderedNode)) {
        renderedNode = <Host>{ renderedNode }</Host>;
      }

      if ('attachShadow' in HTMLElement.prototype) {
        // Attach to Host element.
        appendStyleToHost(renderedNode, target.constructor.name, cssText);
      } else if (target.__styleElement) {
        // Update style inside head.
        const style = target.__styleElement;
        style.innerHTML = cssText;
      } else {
        // Create style and insert inside head.
        const style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.setAttribute("constructible-style", target.constructor.name);
        style.innerHTML = cssText;

        target.__styleElement = style;
        document.head.appendChild(style);
      }

      return renderedNode;
    }

    if (supportsConstructibleStylesheets) {
      // Append style using CSSStyleSheet object.
      target.componentWillLoad = function() {
        this.theme = themeProvider.theme;
        
        styleSheetCreator.call(this, originalWillLoad);
      };
      target.componentWillUpdate = function() {
        styleSheetCreator.call(this, originalWillUpdate);
      };
      target.connectedCallback = function() {
        this.__themeListener = (theme) => {
          this.theme = theme;
          styleSheetCreator.call(this);
        };

        themeProvider.subscribe(this.__themeListener);
        return originalConnected.call(this);
      };
      target.disconnectedCallback = function() {
        themeProvider.unsubscribe(this.__themeListener);

        return originalDisconnected.call(this);
      };
    } else {
      // Fallback for old browser versions.
      target.render = styleSheetRenderer;
    }
  };
}
