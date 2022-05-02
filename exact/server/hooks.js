import { getter } from "../serverState.js";

export const hooks = {
  avail: false,
  useBatchCalledOnce: false,
};

export function useState(initState) {
  throwErrors("Open", "useState");
  return [initState, function () {}];
}

export function useDomRef() {
  throwErrors("Open", "useEffect");
  return false;
}

export function useBatch(fn) {
  throwErrors("Open", "useBatch");
  throwErrors("calledOnce", "useBatch", hooks.useBatchCalledOnce);

  return function () {};
}

export function useServerState(state) {
  throwErrors("Open", "useServerState");
  return [JSON.parse(getter())[state], function () {}];
}

export function useLayoutEffect() {
  throwErrors("Open", "useEffect");
  // return function () {};
}

export function useEffect() {
  throwErrors("Open", "useEffect");
  // return function () {};
}

function throwErrors(typeOfErr, methodName, cond) {
  if (typeOfErr === "Open" && !hooks.avail)
    throw methodName + " function must get called inside of a function";
  if (cond) throw methodName + " function can only get called once";
}
