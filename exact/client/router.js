import { checkMatchedStr } from "./utils.js";
import { handleSingleNode, Components, render, renderDOM } from "./index.js";

const Listeners = new Set(),
  updateRoutes = function () {
    Listeners.forEach(($) => $());
  },
  DismatchedComment = () => new Text("");

window.addEventListener("popstate", updateRoutes);

export function renderRoute(obj, $children) {
  let fallback = null,
    el = null,
    current;

  const scripts = Components.context.scripts,
    component = scripts[obj.component],
    children = $children.map(handleSingleNode).flat(2),
    props = function () {
      return obj;
    },
    isExact = "exact:paths" in obj,
    key = isExact ? "exact:paths" : "paths",
    paths = typeof obj[key] === "number" ? scripts[obj[key]].current : obj[key];

  if (component === undefined) {
    fallback = children.map(DismatchedComment);

    Listeners.add(function () {
      if (checkMatchedStr(paths, isExact)) {
        if (current === children) return;
        current.forEach(($, ind) => $.replaceWith(children[ind]));
        current = children;
      } else {
        if (current === fallback) return;
        current.forEach(($, ind) => $.replaceWith(fallback[ind]));
        current = fallback;
      }
    });

    current = checkMatchedStr(paths, isExact) ? children : fallback;
  } else {
    children.length > 0 &&
      (obj.Children = {
        "#isComponent": false,
        "#isChild": true,
        dom: children,
      });

    fallback = DismatchedComment();
    obj.component = component.current;
    checkMatchedStr(paths, isExact) && (el = render(obj.component, props));

    Listeners.add(function () {
      if (checkMatchedStr(paths, isExact)) {
        if (current === el) return;
        el === null && (el = render(obj.component, props));
        current.replaceWith(el);
        current = el;
      } else {
        if (current === fallback) return;
        current.replaceWith(fallback);
        current = fallback;
      }
    });

    current = el || fallback;
  }

  return current;
}

export function renderLink(obj, children) {
  const el = renderDOM(["a", obj, children]),
    href = () => el.getAttribute("href"),
    title = el.title ? () => el.title : () => document.title;

  el.addEventListener("click", function (e) {
    e.preventDefault();
    const link = href();
    if (link === document.location.pathname) return;
    const T = title();
    window.history.pushState(obj.state || { state: T }, T, link);
    updateRoutes();
  });

  if (checkMatchedStr(href(), true)) {
    document.title = title();
    el.classList.add("currentActiveLink");
  }

  Listeners.add(function () {
    if (checkMatchedStr(href(), true)) {
      document.title = title();
      el.classList.add("currentActiveLink");
      return;
    }
    el.classList.remove("currentActiveLink");
  });

  return el;
}

// const Routes = new Map();
// export function renderSwitch(children) {
// {active: Boolean, update:Function}
//   return;
// }
