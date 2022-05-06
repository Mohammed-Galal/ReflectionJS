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
  return document.querySelector(el).adopt(render(root));
}

export const Components = {
  needToreRender: new Set(),
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

export function render(fn, props, proxify) {
  if (typeof fn !== "function") {
    if (fn["#isComponent"] !== true) {
      if (fn["#isChild"]) return fn.dom;
      throw JSON.stringify(fn) + " must return JSX component";
    }

    return handleComponent(fn).el;
  }

  Boolean(proxify) && proxify(proxyFN);

  props =
    props ||
    function () {
      return {};
    };

  const hooksContext = {
      useBatch: new Set(),
      // useWithdraw: null,
      useState: {
        repo: [],
        currentNode: 0,
      },
      useDomRef: {
        repo: [],
        currentNode: 0,
      },
      useLayoutEffect: {
        repo: [],
        currentNode: 0,

        // needToReRun: true,
        // run: function run() {
        //   this.needToReRun && this.fn !== null && this.fn();
        //   this.needToReRun = false;
        // },
        // fn: null,
        // deps: null,
      },
      useEffect: {
        repo: [],
        currentNode: 0,

        // needToReRun: true,
        // run: function run(dom) {
        //   this.needToReRun && this.fn !== null && this.fn(dom);
        //   this.needToReRun = false;
        // },
        // fn: null,
        // deps: null,
      },
    },
    component = function (isUpdating) {
      Components.updating = isUpdating;
      Hooks.reset(true, hooksContext, proxyFN);
      const C = fn(props());
      Hooks.reset(false);
      Components.updating = false;
      if (C["#isComponent"] !== true)
        throw JSON.stringify(fn) + " must return JSX component";
      return C;
    };

  let { _id, el, update, replace } = handleComponent(component(false));

  return el;

  function proxyFN() {
    const result = component(true);
    if (_id === result._id) update(result.scripts);
    else _id = replace(result);

    Components.needToreRender.forEach(($) => $());
    Components.needToreRender.clear();
  }
}

function handleComponent({ _id, scripts, components, dom }) {
  const cachedContexts = new Map(),
    context = {
      scripts: scripts.map(scriptify),
      components: components,
    };

  Components.addContext(context);
  context.el = handleElement(dom);
  Components.popContext();
  cachedContexts.set(String(_id), context);

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
    const getCached = cachedContexts.get(String(newObj._id));

    if (getCached !== undefined) {
      context.scripts = getCached.scripts;
      context.components = getCached.components;
      context.el.replaceWith(getCached.el);
      context.el = getCached.el;
    } else {
      context.scripts = newObj.scripts.map(scriptify);
      context.components = newObj.components;
      //
      Components.addContext(context);
      const el = handleElement(newObj.dom);
      Components.popContext();
      //
      context.el.replaceWith(el);
      context.el = el;
      cachedContexts.set(String(newObj._id), context);
    }

    update(newObj.scripts);
    return _id;
  }
}

const cachedDomByKeys = new Map();
export function handleElement([tag, props, children]) {
  const propsKeys = Object.keys(props),
    elementHasKey = propsKeys.some((p) => p === "key");

  let K;
  if (elementHasKey) {
    K =
      typeof props["key"] === "number"
        ? scripts[props.keys].current
        : props["key"];

    const getCached = cachedDomByKeys.get(K);
    if (getCached !== undefined) return getCached;
  }

  const scripts = Components.context.scripts,
    components = Components.context.components;

  if (isCustomTag(tag)) {
    const result = handleCustomElements(tag, props, children);
    if (elementHasKey) cachedDomByKeys.set(K, result);
    return result;
  }

  children = children.map(handleNode);

  if (typeof tag === "number") {
    const dynamicProps = {};

    propsKeys.forEach(
      (prop) =>
        typeof props[prop] === "number" && (dynamicProps[prop] = props[prop])
    );

    props.Children = {
      "#isComponent": false,
      "#isChild": true,
      dom: children,
    };

    const keys = Object.keys(dynamicProps),
      result = render(
        components[tag],
        function () {
          keys.forEach((key) => (props[key] = scripts[keys[key]].current));
          return props;
        },
        function (PR) {
          keys.forEach(($) => {
            scripts[dynamicProps[$]].deps.push(function () {
              Components.needToreRender.add(PR);
            });
          });
        }
      );

    if (elementHasKey) cachedDomByKeys.set(K, result);
    return result;
  }

  const el = document.createElement(tag);

  propsKeys.forEach(function ($) {
    var attrName = $,
      attrVal = props[$];

    if (attrName === "key") return;
    else if (attrName === "class") attrName = "className";
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
  if (elementHasKey) cachedDomByKeys.set(K, el);
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
  const placeHolder = new Text();
  placeHolder["#deps"] = arrOfEls.map(($) => handleComponent($).el);

  return {
    dom: placeHolder,
    update: function () {
      const oldList = placeHolder["#deps"],
        newList = arrOfEls.map((C) => handleComponent(C).el);

      const oldLen = oldList.length,
        newLen = newList.length,
        endPos = oldLen > newLen ? oldLen : newLen;

      let index = 0;
      while (index < endPos) {
        const oldC = oldList[index],
          newC = newList[index];
        if (oldC === undefined) placeHolder.spreadBefore(newC);
        else if (newC === undefined) oldC.deepRemove();
        else oldC.replace(newC);
        index++;
      }

      placeHolder["#deps"] = newList;
    },
  };
}
