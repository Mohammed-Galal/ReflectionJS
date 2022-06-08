import { Components } from "./index.js";

let crashed = false;
export const Hooks = {
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
    ["useState", "useEffect", "useRef"].forEach(
      ($) => (Hooks.context[$].currentNode = 0)
    );
    this.updateCurrentComponent = null;
    this.context = null;
  },
};

export function useState(initState) {
  const BatchInfo = Hooks.context.useBatch,
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
  const BatchInfo = Hooks.context.useBatch;

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

export function useRef() {
  const targetHook = initHook("useRef"),
    states = targetHook.repo,
    stateNode = targetHook.currentNode;

  if (Components.updating) return states[stateNode];
  else states[stateNode] = {};

  return states[stateNode];
}

export function useEffect(fn, deps) {
  const targetHook = initHook("useEffect"),
    states = targetHook.repo,
    stateNode = targetHook.currentNode;

  if (Components.updating) {
    const targetInfo = states[stateNode],
      oldDeps = targetInfo.deps;

    if (oldDeps === undefined || oldDeps.some(($, ind) => $ !== deps[ind])) {
      targetInfo.deps = deps;
      targetInfo.fn = fn;
      targetInfo.needToreRun = true;
    }
  } else
    states[stateNode] = {
      needToreRun: true,
      deps: deps,
      fn: fn,
      run() {
        if (this.needToreRun) this.fn.call(null);
        this.needToreRun = false;
      },
    };
}

export function createContext(fn) {
  fn = typeof fn !== "function" ? fn : fn();

  const middlewares = [],
    deps = new Set();

  return function () {
    if (!Hooks.avail) {
      crashed = true;
      throw new Error(
        `createContext Hook must only get invoked outside of a function`
      );
    }

    const update = Hooks.updateCurrentComponent,
      BatchInfo = Hooks.context.useBatch;

    return {
      get getState() {
        deps.add(update);
        return fn;
      },
      subscribe(fn) {
        if (typeof fn !== "function") {
          crashed = true;
          throw new Error(`the subscribe argument must be a function`);
        }
        if (Components.updating) return;
        middlewares.push(fn);
      },
      setState(setterFN) {
        fn = typeof setterFN !== "function" ? setterFN : setterFN(fn);
        middlewares.forEach(($) => $(fn));

        const arr = Array.from(deps);
        deps.clear();

        if (!BatchInfo.active)
          return arr.forEach(function ($) {
            $();
          });

        arr.forEach(function ($) {
          BatchInfo.repo.add($);
        });
      },
    };
  };
}

// !================================
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
      there is an error occured during setting the hooks,
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
