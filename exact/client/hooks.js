import { Components } from "./index.js";

let crashed = false;
export const Hooks = {
  useBatchOn: false,
  updateCurrentComponent: null,
  avail: false,
  context: null,
  //
  reset(bool, $context, updater) {
    this.avail = bool;
    if (bool) {
      this.updateCurrentComponent = updater;
      this.context = $context;
      return;
    }
    ["useState"].forEach(($) => (Hooks.context[$].currentNode = 0));
    this.updateCurrentComponent = null;
    this.context = null;
  },
};

function initHook(hookName) {
  const update = Hooks.updateCurrentComponent,
    targetHook = Hooks.context[hookName],
    currentNode = targetHook.currentNode;
  targetHook.currentNode++;

  if (
    !Hooks.avail ||
    (Components.updating && currentNode >= targetHook.repo.length)
  ) {
    crashed = true;
    throw new Error(`
      there is an error eccured during setting the hooks,
      please put the following rules in considiration when using hooks:-
      
      1- hooks must get called inside of functional components
      2- hooks cannot get called inside if Loops or If Statements
      `);
  }

  return {
    update,
    targetHook: {
      repo: targetHook.repo,
      currentNode,
    },
  };
}

export function useState(initState) {
  const { update, targetHook } = initHook("useState"),
    states = targetHook.repo,
    stateNode = targetHook.currentNode;

  if (Components.updating) initState = states[stateNode];
  else states[stateNode] = initState;

  return [
    initState,
    function (newVal) {
      if (newVal === initState || crashed) return false;
      states[stateNode] = newVal;
      if (!Hooks.useBatchOn) return update();
      Hooks.context.useBatch.add(update);
    },
  ];
}

export function useDomRef() {
  const targetedComponent = Components.currentContext.useDomRef,
    refs = targetedComponent.repo,
    refNode = targetedComponent.currentNode;
  targetedComponent.currentNode++;

  checkHooksRules("useDomRef", refNode);

  if (!Components.updating) refs[refNode] = {};

  if (crashed) return false;
  return refs[refNode];
}

export function useLayoutEffect(fn, deps) {
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

function checkHooksRules(hookName, currentNode) {}
