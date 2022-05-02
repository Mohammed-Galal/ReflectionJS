import { Hooks } from "./hooks.js";

export const Components = {
  root: document.getElementById("root"),
  updating: false,
  context: null,
};

const availDataTypes = ["string", "number", "boolean", "symbol", "function"],
  cachedDomByKeys = new Map();

export default function render(fn, props, proxify) {
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
      run: function () {
        this.needToReRun && this.fn !== null && this.fn();
        this.needToReRun = false;
      },
      fn: null,
      deps: null,
    },
    useEffect: {
      needToReRun: true,
      run: function (dom) {
        this.needToReRun && this.fn !== null && this.fn(dom);
        this.needToReRun = false;
      },
      fn: null,
      deps: null,
    },
  };

  let component = function () {
    return fn;
  };

  if (typeof fn === "function") {
    Boolean(proxify) && proxify(proxyFN);

    props =
      props ||
      function () {
        return {};
      };

    component = function (isUpdateing) {
      Components.updating = isUpdateing;

      Hooks.reset(true, hooksContext, proxyFN);
      const C = fn(props());
      Hooks.reset(false);

      Components.updating = false;

      hooksContext.useState.node = 0;
      hooksContext.useDomRef.refNode = 0;

      return C;
    };
  }

  const result = component(false);
  if (result["#isComponent"] !== true) {
    hooksContext = null;
    if (result["#isChild"]) return result.dom;
    throw fn + "must return JSX component";
  }

  let VALUE;
  const key = result.dom[1].key;
  if (key !== undefined) {
    const getCached = cachedDomByKeys.get("" + key);
    if (getCached !== undefined) return getCached.el;

    VALUE = handleComponent(result, proxyFN);
    cachedDomByKeys.set("" + key, VALUE);
  } else VALUE = handleComponent(result, proxyFN);

  return VALUE.el;

  function proxyFN() {
    VALUE.el = null;
    const newResult = component(true);
    VALUE._id === newResult._id
      ? VALUE.update(newResult.scripts)
      : (VALUE._id = VALUE.replace(newResult));
  }
}

function handleComponent({ _id, components, scripts, dom }) {
  const cachedContexts = new Map(),
    context = {
      scripts: scripts.map(scriptify),
      components,
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
    _id,
    el: context.el,
    update,
    replace,
  };

  function update(newScripts) {
    newScripts.forEach(function ($, ind) {
      if (typeof $ === "function") return (context.scripts[ind].current = $);
      else if (context.scripts[ind] === $) return;

      context.scripts[ind].current = $;
      context.scripts[ind].deps.forEach(function ($$) {
        $$();
      });
    });
  }

  function replace(newObj) {
    const getCached = cachedContexts.get("" + newObj._id);
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
      const el = renderDOM(newObj.dom);
      Components.context = null;

      context.el.replaceWith(el);
      context.el = el;
      cachedContexts.set("" + _id, context);
    }

    update(newObj.scripts);

    return _id;
  }
}

function renderDOM([tag, props, children], isChild) {
  const scripts = Components.context.scripts,
    components = Components.context.components,
    propsKeys = Object.keys(props);

  if (typeof tag !== "number") {
    const isFragment = tag === "",
      el = isFragment ? Components.root : document.createElement(tag);

    !isFragment &&
      propsKeys.forEach(function ($) {
        let attrName = $,
          attrVal = props[$];

        if (attrName === "key") return;
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

        switch (attrName) {
          case "class":
            el["className"] = attrVal;
            break;
          default:
            el[attrName] = attrVal;
        }
      });

    renderChildren(children, el);
    return el;
  }

  children.length > 0 &&
    isChild &&
    (props.Children = {
      "#isComponent": false,
      "#isChild": true,
      dom: renderDOM(children[0], true),
    });

  const dynamicProps = {};
  propsKeys.forEach(function (prop) {
    const val = props[prop];
    if (typeof val !== "number") return;
    if (typeof scripts[val].current !== "function")
      return (dynamicProps[prop] = val);

    props[prop] = function () {
      return scripts[val].current.apply(null, arguments);
    };
  });

  const Keys = Object.keys(dynamicProps);
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
}

function renderChildren(children, parent) {
  const scripts = Components.context.scripts;

  children.forEach(function (node) {
    const nodeType = typeof node;
    if (nodeType === "string") return parent.appendChild(new Text(node));
    else if (nodeType !== "number")
      return node[0] === ""
        ? renderChildren(node[2], parent)
        : parent.appendChild(renderDOM(node));
    // ?============================

    {
      const val = scripts[node].current,
        isNotPremitive = availDataTypes.some((D) => typeof D !== val);

      let isArrayOfComponents;
      if (isNotPremitive) {
        val instanceof Array &&
          val[0]["#isComponent"] &&
          (isArrayOfComponents = true);
      }

      if (isArrayOfComponents)
        return scripts[node].deps.push(renderLoop(val, parent));
      // renderLoop Should return the Update Function
    }

    const TXT = new Text(""),
      reseter = function () {
        TXT.textContent = scripts[node].current;
      };
    reseter();

    scripts[node].deps.push(reseter);
    parent.appendChild(TXT);
  });
}

function renderLoop(arr, container) {
  let map = arr.map((component) => render(component));
  map.forEach((C) => container.appendChild(C));

  return function () {
    map.forEach((C) => container.removeChild(C));
    map = arr.map((component) => render(component));
    map.forEach((C) => container.appendChild(C));
  };
}

// !=========================
function scriptify(val) {
  return {
    current: val,
    deps: [],
  };
}
