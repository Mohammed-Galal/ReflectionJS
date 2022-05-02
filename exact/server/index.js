import { hooks } from "./hooks.js";

const listOfSelfClosingTags = [
  "menuitem",
  "keygen",
  "command",
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

function isSelfClosed(tag) {
  return listOfSelfClosingTags.some(($) => $ === String(tag).toLowerCase());
}

export default function (fn) {
  return renderFN(fn);
}

export const componentsState = {
  currentOpen: [],
  get currentActive() {
    return this.currentOpen[this.currentOpen.length - 1];
  },
};

function renderFN(fn, props) {
  let component = function () {
    return fn;
  };

  if (typeof fn === "function") {
    props =
      props ||
      function () {
        return {};
      };

    component = function () {
      hooks.avail = true;
      const FN = fn(props);
      hooks.avail = false;
      return FN;
    };
  }

  let result = component();
  if (!result["#isComponent"]) {
    if (result["#isChild"]) return result.dom;
    throw component + "muse return JSX component";
  }
  componentsState.currentOpen.push(result);
  const dom = renderDOM(result.dom);
  componentsState.currentOpen.pop();
  result = null;
  return dom;
}

function renderDOM(dom) {
  const { scripts, components } = componentsState.currentActive,
    tag = dom[0],
    props = dom[1] || {};

  if (typeof tag === "number") {
    props.Children = {
      "#isComponent": false,
      "#isChild": true,
      dom: dom[2].map(($) => renderDOM($)),
    };

    Object.keys(props).forEach(function (prop) {
      const val = props[prop],
        isDynamic = typeof val === "number";
      if (isDynamic) return (props[prop] = scripts[val]);
    });

    return renderFN(components[tag], props);
  }

  const children = dom[2].map(function (node) {
    const nodeType = typeof node;
    if (nodeType === "string") return node;
    else if (nodeType === "number") {
      return scripts[node];
    }
    return renderDOM(node);
  });

  return isSelfClosed(tag)
    ? "<" + tag + "/>"
    : "<" + tag + ">" + children.join("") + "</" + tag + ">";
}
