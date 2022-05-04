import "./bootstrap.js";
import { Hooks } from "./hooks.js";
import handleCustomElements from "./router.js";
import { scriptify, encodeHTML, isCustomTag } from "./utils.js";

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

export default function (root, el) {
  if (typeof root === "function")
    throw "the root Component must not be a function";
  if (!root["#isComponent"]) return "the root element is not a JSX Component";

  return document.getElementById(el).adopt(render(root));
}

export var Components = {
  updating: false,
  currentActive: [],
  get context() {
    return this.currentActive[this.currentActive.length - 1];
  },
  addContext(context) {
    this.currentActive.push(context);
  },
  popContext() {
    this.currentActive.pop();
  },
};

const cachedDomByKeys = new Map();
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
  Components.addContext(context);
  context.el = handleElement(dom);
  Components.popContext();
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

export function handleElement(element) {
  const scripts = Components.context.scripts,
    components = Components.context.components,
    children = element[2].map(handleNode);

  const tag = element[0],
    props = element[1];

  if (isCustomTag(tag)) return handleCustomElements(tag, props, children);

  if (typeof tag === "number") {
    const dynamicProps = {};

    Object.keys(props).forEach(
      (prop) =>
        typeof props[prop] === "number" && (dynamicProps[prop] = props[prop])
    );

    props.Children = {
      "#isComponent": false,
      "#isChild": true,
      dom: children,
    };

    const keys = Object.keys(dynamicProps);

    return render(
      components[tag],
      function () {
        keys.forEach((key) => (props[key] = scripts[keys[key]].current));
        return props;
      },
      function (PR) {
        keys.forEach(($) => scripts[dynamicProps[$]].deps.push(PR));
      }
    );
  }

  const el = document.createElement(tag);

  Object.keys(props).forEach(function ($) {
    var attrName = $,
      attrVal = props[$];
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

  el.adopt(children);

  return el;
}

export function handleNode(node) {
  const nodeType = _typeof(node);

  if (nodeType === "string") return new Text(encodeHTML(node));
  else if (nodeType === "number") {
    const scripts = Components.context.scripts,
      script = scripts[node];

    if (script.current instanceof Array) {
      const result = renderLoop(script.current);
      script.deps.push(result.update);
      return result.dom;
    }

    const TXT = new Text("");
    reset();
    script.deps.push(reset);
    return TXT;

    function reset() {
      TXT.textContent = encodeHTML(script.current);
    }
  }

  return handleElement(node);
}

function renderLoop(arrOfEls) {
  const TXT = new Text("");
  TXT["#deps"] = arrOfEls.map(render);
  const children = TXT["#deps"];

  function cleanUp(startPos, endPos) {
    while (startPos <= endPos) {
      children[startPos]["#deps"].forEach(($) => $.remove());
      children[startPos].remove();
      children[startPos] = undefined;
      startPos++;
    }
  }

  return {
    dom: TXT,
    update: function () {
      let currentIndex = 0;
      TXT["#deps"] = arrOfEls.map(render);

      children.forEach((C, ind) => {
        children[ind] === undefined
          ? children[ind].after(C)
          : children[ind].replace(C);

        children[ind] = C;
        current = ind;
      });

      cleanUp(currentIndex + 1, children.length);
    },
  };
}
