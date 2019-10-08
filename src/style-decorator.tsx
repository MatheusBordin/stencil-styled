import { h, Host, getElement } from "@stencil/core";
import { VNode, ComponentInterface } from "@stencil/core/dist/declarations";
import { ConstructibleStyleDecorator } from "./types/constructible-style-decorator";
import { supportsConstructibleStylesheets } from "./utils/support-helper";
import { getOrCreateStylesheet, appendStyleToHost } from "./utils/stylesheet-helper";
import { isHost } from "./utils/host-helper";
import { ThemeProvider } from "./theme";
import { instanceToProps } from "./instance-parser";

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
      console.warn(`ConstructibleStyle requires you to have a \`componentWillUpdate\` lifecycle method in \`${ target.constructor.name }\`. Failure to add this function may cause ConstructibleStyle to fail due to StencilJS build optimizations.`);
    }

    if (!originalConnected) {
      console.warn(`ConstructibleStyle requires you to have a \`connectedCallback\` lifecycle method in \`${ target.constructor.name }\`. Failure to add this function may cause ConstructibleStyle to fail due to StencilJS build optimizations.`);
    }

    if (!originalDisconnected) {
      console.warn(`ConstructibleStyle requires you to have a \`disconnectedCallback\` lifecycle method in \`${ target.constructor.name }\`. Failure to add this function may cause ConstructibleStyle to fail due to StencilJS build optimizations.`);
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

      const newStyleSheet = getOrCreateStylesheet(target, this, propertyKey)
      if (newStyleSheet != null) {
        root.adoptedStyleSheets = [
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
      let renderedNode: VNode = originalRender.call(this);
      const cssText = this[propertyKey](instanceToProps(this));

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

      this.__lastRenderer = renderedNode;

      return renderedNode;
    }

    /**
     * Update stylesheet.
     *
     * @returns
     */
    function styleSheetUpdater() {
      const cssText = this[propertyKey](instanceToProps(this));

      if ('attachShadow' in HTMLElement.prototype) {
        // Attach to Host element.
        if (!this.__lastRenderer) {
          return;
        }

        this.__lastRenderer["$elm$"].styleSheets["0"].ownerNode.innerHTML = cssText;
      } else if (target.__styleElement) {
        // Update style inside head.
        const style = target.__styleElement;
        style.innerHTML = cssText;
      }
    }

    if (supportsConstructibleStylesheets) {
      // Append style using CSSStyleSheet object.
      target.componentWillLoad = function() {
        styleSheetCreator.call(this, originalWillLoad);
      };
      target.componentWillUpdate = function() {
        styleSheetCreator.call(this, originalWillUpdate);
      };
      target.connectedCallback = function() {
        this.__themeSubscription = ThemeProvider.subscribe(() => {
          styleSheetCreator.call(this);
        });

        return originalConnected && originalConnected.call(this);
      };
      target.disconnectedCallback = function() {
        this.__themeSubscription.unsubscribe();

        return originalDisconnected && originalDisconnected.call(this);
      };
    } else {
      target.componentWillLoad = function() {
        return originalWillLoad && originalWillLoad.call(this);
      };
      target.connectedCallback = function() {
        this.__themeSubscription = ThemeProvider.subscribe(() => {
          styleSheetUpdater.call(this);
        });
        return originalConnected && originalConnected.call(this);
      };
      target.disconnectedCallback = function() {
        this.__themeSubscription.unsubscribe();

        return originalDisconnected && originalDisconnected.call(this);
      };

      // Fallback for old browser versions.
      target.render = styleSheetRenderer;
    }
  };
}
