import { Components } from "./index.js";

let crashed = false;
export const Hooks = {
  useBatch: { active: false, repo: new Set() },
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

export function useState(initState) {
  const BatchInfo = Hooks.useBatch,
    update = Hooks.updateCurrentComponent,
    targetHook = initHook("useState"),
    states = targetHook.repo,
    stateNode = targetHook.currentNode;

  if (Components.updating) initState = states[stateNode];
  else states[stateNode] = initState;

  return [
    initState,
    function (newVal) {
      if (newVal === initState || crashed) return false;
      states[stateNode] = newVal;
      if (!BatchInfo.active) return update();
      BatchInfo.repo.add(update);
      return true;
    },
  ];
}

export function useBatch(fn) {
  const BatchInfo = Hooks.useBatch;

  if (!Hooks.avail) {
    crashed = true;
    throw new Error(`
      there is an error eccured during setting the hooks,
      please put the following rules in considiration when using hooks:-
      
      1- hooks must get called inside of functional components
      2- hooks cannot get called inside if Loops or If Statements
      `);
  }

  return function () {
    BatchInfo.active = true;
    fn.apply(null, arguments);
    BatchInfo.repo.forEach(function ($) {
      $();
    });
    BatchInfo.active = false;
    BatchInfo.repo.clear();
  };
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
//
function initHook(hookName) {
  const targetHook = Hooks.context[hookName],
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
    repo: targetHook.repo,
    currentNode,
  };
}
//
// export function useDomRef() {
//   const targetedComponent = Components.currentContext.useDomRef,
//     refs = targetedComponent.repo,
//     refNode = targetedComponent.currentNode;
//   targetedComponent.currentNode++;

//   checkHooksRules("useDomRef", refNode);

//   if (!Components.updating) refs[refNode] = {};

//   if (crashed) return false;
//   return refs[refNode];
// }

// export function useLayoutEffect(fn, deps) {
//   const effects = Components.currentContext.useLayoutEffect;

//   if (arguments.length === 1) {
//     effects.needToReRun = true;
//     effects.fn = fn;
//     return;
//   }

//   if (effects.deps === null) {
//     effects.deps = deps;
//     effects.fn = fn;
//     return;
//   }

//   effects.needToReRun = effects.deps.some(function ($, ind) {
//     return $ !== deps[ind];
//   });

//   if (effects.needToReRun) {
//     effects.deps = deps;
//     effects.fn = fn;
//   }
// }
