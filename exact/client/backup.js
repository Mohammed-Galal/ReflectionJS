import { Hooks } from "./hooks.js";
import { renderLink, renderRoute, renderSwitch } from "./router.js";
import { scriptify, encodeHTML, checkIfCustomTag } from "./utils.js";

function _typeof(obj) {
  "@babel/helpers - typeof";
  return (
    (_typeof =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (obj) {
            return typeof obj;
          }
        : function (obj) {
            return obj &&
              "function" == typeof Symbol &&
              obj.constructor === Symbol &&
              obj !== Symbol.prototype
              ? "symbol"
              : typeof obj;
          }),
    _typeof(obj)
  );
}

export var Components = {
  root: [],
  get currentParent() {
    return this.root[this.root.length - 1];
  },
  updating: false,
  context: null,
};

const availDataTypes = ["string", "number", "boolean", "symbol", "function"],
  cachedDomByKeys = new Map();

export default function (root, el) {
  if (typeof root === "function")
    throw "the root Component must not be a function";
  if (!root["#isComponent"]) return "the root element is not a JSX Component";

  const result = render(root);
  document.getElementById(el).append(result);
}

export function render(fn, props, proxify) {
  let hooksContext = {
    useBatch: new Set(),
    useWithdraw: null,
    useState: {
      arr: [],
      node: 0,
    },
    useDomRef: {
      refs: [],
      refNode: 0,
    },
    useLayoutEffect: {
      needToReRun: true,
      run: function run() {
        this.needToReRun && this.fn !== null && this.fn();
        this.needToReRun = false;
      },
      fn: null,
      deps: null,
    },
    useEffect: {
      needToReRun: true,
      run: function run(dom) {
        this.needToReRun && this.fn !== null && this.fn(dom);
        this.needToReRun = false;
      },
      fn: null,
      deps: null,
    },
  };

  var component = function component() {
    return fn;
  };

  if (typeof fn === "function") {
    Boolean(proxify) && proxify(proxyFN);

    props =
      props ||
      function () {
        return {};
      };

    component = function component(isUpdating) {
      Components.updating = isUpdating;
      Hooks.reset(true, hooksContext, proxyFN);
      var C = fn(props());
      Hooks.reset(false);
      Components.updating = false;
      hooksContext.useState.node = 0;
      hooksContext.useDomRef.refNode = 0;
      return C;
    };
  }

  var result = component(false);
  try {
    if (result["#isComponent"] !== true) {
      hooksContext = null;
      if (result["#isChild"]) return result.dom;
      throw fn + " must return JSX component";
    }
  } catch {
    hooksContext = null;
    return;
  }

  var VALUE;
  var key = result.dom[1].key;

  if (key !== undefined) {
    var getCached = cachedDomByKeys.get("" + key);
    if (getCached !== undefined) return getCached.el;
    VALUE = handleComponent(result, proxyFN);
    cachedDomByKeys.set("" + key, VALUE);
  } else VALUE = handleComponent(result, proxyFN);

  return VALUE.el;

  function proxyFN() {
    VALUE.el = null;
    var newResult = component(true);
    VALUE._id === newResult._id
      ? VALUE.update(newResult.scripts)
      : (VALUE._id = VALUE.replace(newResult));
  }
}

function handleComponent(_ref) {
  var _id = _ref._id,
    components = _ref.components,
    scripts = _ref.scripts,
    dom = _ref.dom;
  var cachedContexts = new Map(),
    context = {
      scripts: scripts.map(scriptify),
      components: components,
    };
  Components.context = context;
  context.el = renderDOM(dom);
  Components.context = null;
  cachedContexts.set("" + _id, context);
  {
    dom = null;
    components = null;
    scripts = null;
  }
  return {
    _id: _id,
    el: context.el,
    update: update,
    replace: replace,
  };

  function update(newScripts) {
    newScripts.forEach(function ($, ind) {
      var script = context.scripts[ind].current,
        isArray = script instanceof Array;

      if (typeof script === "function")
        return (context.scripts[ind].current = $);
      else if (!isArray && script === $) return;

      context.scripts[ind].current = $;
      context.scripts[ind].deps.forEach(function ($$) {
        $$();
      });
    });
  }

  function replace(newObj) {
    var getCached = cachedContexts.get("" + newObj._id);

    if (getCached !== undefined) {
      context.el.replaceWith(getCached.el);
      _id = newObj._id;
      context.scripts = getCached.scripts;
      context.components = getCached.components;
      context.el = getCached.el;
    } else {
      _id = newObj._id;
      context.scripts = newObj.scripts.map(scriptify);
      context.components = newObj.components;
      Components.context = context;
      var el = renderDOM(newObj.dom);
      Components.context = null;
      context.el.replaceWith(el);
      context.el = el;
      cachedContexts.set("" + _id, context);
    }

    update(newObj.scripts);
    return _id;
  }
}

export function renderDOM([tag, props, children]) {
  var scripts = Components.context.scripts,
    components = Components.context.components;

  if (typeof tag === "number") {
    const propsKeys = Object.keys(props);

    children.length > 0 &&
      (props.Children = {
        "#isComponent": false,
        "#isChild": true,
        dom: children.map(handleSingleNode),
      });

    var dynamicProps = {};
    propsKeys.forEach(function (prop) {
      var val = props[prop];
      if (typeof val !== "number") return;
      if (typeof scripts[val].current !== "function")
        return (dynamicProps[prop] = val);

      props[prop] = function () {
        return scripts[val].current.apply(null, arguments);
      };
    });

    var Keys = Object.keys(dynamicProps);
    return render(
      components[tag],
      function () {
        Keys.forEach(function (prop) {
          props[prop] = scripts[dynamicProps[prop]].current;
        });
        return props;
      },
      function (PR) {
        Keys.forEach(function ($) {
          scripts[dynamicProps[$]].deps.push(PR);
        });
      }
    );
  } else if (checkIfCustomTag(tag)) {
    switch (tag) {
      case "Switch":
        return renderSwitch(props, children);
      case "Route":
        return renderRoute(props, children);
      case "Link":
        return renderLink(props, children);
      default:
        // we should return Array Of Nodes
        return children.map(handleSingleNode);
    }
  }

  const el = document.createElement(tag);

  attachAttrs(props, el);

  children.map(handleSingleNode).forEach(function attachChildren(node) {
    if (node instanceof Array) return node.forEach(attachChildren);
    return el.appendChild(node);
  });

  return el;
}

export function attachAttrs(obj, el) {
  const scripts = Components.context.scripts;

  Object.keys(obj).forEach(function ($) {
    var attrName = $,
      attrVal = obj[$];
    if (attrName === "class") return (attrName = "className");
    else if (attrName === "key") return;
    else if (typeof attrVal === "number") {
      if (/^on[A-Z]/.exec(attrName)) {
        attrName = attrName.toLowerCase().slice(2);
        return el.addEventListener(attrName, function () {
          scripts[attrVal].current.apply(el, arguments);
        });
      } else if (attrName === "ref")
        return (scripts[attrVal].current.current = el);

      function reseter() {
        el[attrName] = scripts[attrVal].current;
      }

      scripts[attrVal].deps.push(reseter);
      return reseter();
    }

    el[attrName] = encodeHTML(attrVal);
  });
}

export function handleSingleNode(node) {
  const scripts = Components.context.scripts,
    nodeType = _typeof(node);

  if (nodeType === "string") return new Text(encodeHTML(node));
  else if (nodeType === "number") {
    var val = scripts[node],
      isNotPremitive = availDataTypes.some(function (D) {
        return _typeof(D) !== val;
      });

    if (isNotPremitive && val instanceof Array && val[0]["#isComponent"])
      return val.deps.push(renderLoop(val.current));

    var TXT = new Text(""),
      reseter = function reseter() {
        TXT.textContent = encodeHTML(val.current);
      };

    reseter();
    scripts[node].deps.push(reseter);
    return TXT;
  }

  return renderDOM(node);
}

function renderLoop(arr, container) {
  var map = arr.map(function (component) {
    return render(component);
  });
  map.forEach(function (C) {
    return container.appendChild(C);
  });
  return function () {
    map.forEach(function (C) {
      return container.removeChild(C);
    });
    map = arr.map(function (component) {
      return render(component);
    });
    map.forEach(function (C) {
      return container.appendChild(C);
    });
  };
}
