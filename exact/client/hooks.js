import { Components } from "./index.js";

export const Hooks = {
  updateCurrentComponent: null,
  avail: false,
  context: null,
  reset(bool, $context, updater) {
    this.avail = bool;
    if (!bool) {
      // if bool === false
      this.updateCurrentComponent = null;
      return (this.context = null);
    }
    this.updateCurrentComponent = updater;
    this.context = $context;
  },
};

export function useState(initState) {
  throwErrors("Open", "useState");

  const targetedComponent = Hooks.context,
    update = Hooks.updateCurrentComponent,
    states = targetedComponent.useState.arr,
    stateNode = targetedComponent.node;
  targetedComponent.useState.node++;

  Components.updating
    ? (initState = states[stateNode])
    : (states[stateNode] = initState);

  return [
    initState,
    function (newVal) {
      if (newVal === initState) return false;
      targetedComponent.useState.arr[stateNode] = newVal;
      if (!Hooks.useBatchOn) return update();
      targetedComponent.useBatch.add(update);
    },
  ];
}

export function useDomRef() {
  throwErrors("Open", "useDomRef");

  const targetedComponent = Components.currentContext.useDomRef,
    refs = targetedComponent.refs,
    refNode = targetedComponent.refNode;
  targetedComponent.refNode++;

  if (!Components.updating) refs[refNode] = {};

  return refs[refNode];
}

export function useLayoutEffect(fn, deps) {
  throwErrors("Open", "useEffect");

  const effects = Components.currentContext.useLayoutEffect;

  if (arguments.length === 1) {
    effects.needToReRun = true;
    effects.fn = fn;
    return;
  }

  if (effects.deps === null) {
    effects.deps = deps;
    effects.fn = fn;
    return;
  }

  effects.needToReRun = effects.deps.some(function ($, ind) {
    return $ !== deps[ind];
  });

  if (effects.needToReRun) {
    effects.deps = deps;
    effects.fn = fn;
  }
}

export function useEffect(fn, deps) {
  throwErrors("Open", "useEffect");

  const effects = Components.currentContext.useEffect;

  if (arguments.length === 1) {
    effects.needToReRun = true;
    effects.fn = fn;
    return;
  }

  if (effects.deps === null) {
    effects.deps = deps;
    effects.fn = fn;
    return;
  }

  effects.needToReRun = effects.deps.some(function ($, ind) {
    return $ !== deps[ind];
  });

  if (effects.needToReRun) {
    effects.deps = deps;
    effects.fn = fn;
  }
}

export function useBatch(fn) {
  throwErrors("Open", "useBatch");
  // throwErrors("calledOnce", "useBatch", stateBar.calledOnce);

  const targetedComponent = Components.currentContext;
  return function () {
    hooks.useBatchOn = true;
    fn.apply(null, arguments);
    targetedComponent.useBatch.forEach(function ($) {
      $();
    });
    hooks.useBatchOn = false;
    targetedComponent.useBatch.clear();
  };
}

// !================================
export function createContext(fn) {
  if (hooks.avail)
    throw "createContext function must get called outside of components";

  fn = typeof fn !== "function" ? fn : fn(demoServerState);

  const deps = new Set();

  return function () {
    throwErrors("Open", "createContext setter function");

    const targetedComponent = Components.currentContext;
    deps.add(targetedComponent.proxyFN);

    return [
      fn,
      function (setterFN) {
        if (typeof setterFN !== "function")
          throw "createContext setter must be function";

        fn = setterFN(fn);

        if (!hooks.useBatchOn)
          return deps.forEach(function ($) {
            $();
          });

        deps.forEach(function ($) {
          targetedComponent.useBatch.add($);
        });
        deps.clear();
      },
    ];
  };
}

export function useWithdraw(fn) {
  throwErrors("Open", "useWithdraw");
  if (typeof fn !== "function") throw "useWithdra ARGUMENT must be a funcion";
  Components.currentContext.useWithdraw = fn;
}

function throwErrors(typeOfErr, methodName, cond) {
  if (typeOfErr === "Open" && !Hooks.avail)
    throw methodName + " function must get called inside of a function";
  if (cond) throw methodName + " function can only get called once";
}
