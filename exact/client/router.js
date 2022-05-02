import { handleSingleNode, Components, render } from "./index.js";
import { checkMatchedStr } from "./utils.js";

const Routes = {};

function RouterSubscribe(paths, updateFN) {
  if (typeof paths === "string") {
    !(paths in Routes) && [(Routes[paths] = new Set())];
    return (Routes[paths] = updateFN);
  }
  paths.forEach((route) => RouterSubscribe(route, updateFN));
}

const DismatchedComment = new Text("");
export function renderRoute(obj, children) {
  let fallback = DismatchedComment,
    el = null,
    current;

  const scripts = Components.context.scripts,
    props = function () {
      return obj;
    },
    isExact = "exact:paths" in obj,
    key = isExact ? "exact:paths" : "paths",
    paths = typeof obj[key] === "number" ? scripts[obj[key]].current : obj[key];

  obj.component = scripts[obj.component].current;

  children.length > 0 &&
    (obj.Children = {
      "#isComponent": false,
      "#isChild": true,
      dom: children.map(handleSingleNode),
    });

  checkMatchedStr(paths, isExact) && (el = render(obj.component, props));

  RouterSubscribe(paths, function () {
    if (checkMatchedStr(paths, isExact)) {
      if (current === el) return;
      current.replaceWith(el);
      current = el;
    } else {
      if (current === fallback) return;
      current.replaceWith(fallback);
      current = fallback;
    }
  });

  current = el || fallback;

  return current;
}
