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
      if (fn["#isChild"]) {
        const txt = new Text();
        txt["#deps"] = fn.dom;
        return txt;
      }
      return JSON.stringify(fn);
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
      useBatch: { active: false, repo: new Set() },
      useState: {
        repo: [],
        currentNode: 0,
      },
      useRefs: {
        calledOnce: false,
        repo: {},
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
      if (C["#isComponent"] !== true) return JSON.stringify(fn);
      return C;
    };

  let { _id, el, refs, update, replace } = handleComponent(component(false));

  hooksContext.useRefs.repo = refs;

  hooksContext.useEffect.repo.forEach(($) => $.run());

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
    refs = {},
    context = {
      refs: refs,
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
    refs: refs,
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
  const elementHasKey = "key" in props,
    K =
      typeof props["key"] === "number"
        ? scripts[props.keys].current
        : props["key"];

  if (elementHasKey) {
    const getCached = cachedDomByKeys.get(K);
    if (getCached !== undefined) return getCached;
  }

  const propsKeys = Object.keys(props),
    // elementHasKey = propsKeys.some((p) => p === "key");
    scripts = Components.context.scripts,
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

    const valISDynamic = typeof attrVal === "number";

    if (attrName === "key") return;
    else if (attrName === "class") attrName = "className";
    else if (attrName === "ref") {
      const refs = Components.context.refs;
      if (valISDynamic) return (refs[scripts[attrVal].current] = el);
      return (refs[attrVal] = el);
    } else if (valISDynamic) {
      if (/^on[A-Z]/.exec(attrName)) {
        attrName = attrName.toLowerCase().slice(2);
        return el.addEventListener(attrName, function () {
          scripts[attrVal].current.apply(el, arguments);
        });
      }

      function reseter() {
        el[attrName] = scripts[attrVal].current;
      }

      scripts[attrVal].deps.push(reseter);
      return reseter();
    }

    el[attrName] = encodeHTML(attrVal);
  });

  children.forEach(($) => el.adopt($));
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
