import { VNode } from "@stencil/core/dist/declarations";
import { Host } from "@stencil/core";

export function isHost(node): boolean {
    for (let prop in node) {
      if (node.hasOwnProperty(prop)) {
        if (node[prop] === Host) {
          return true;
        }
      }
    }

    return false;
}
  
export function getHostChildren(node): Array<VNode> {
    for (let prop in node) {
        if (node.hasOwnProperty(prop)) {
            if (Array.isArray(node[prop])) {
                return node[prop];
            }
        }
    }

    return null;
}