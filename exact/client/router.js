import { checkMatchedStr } from "./utils.js";
import { Components, render, handleElement } from "./index.js";

const Listeners = new Set(),
  updateRoutes = function () {
    Listeners.forEach(($) => $());
  },
  DismatchedComment = () => new Text("");

window.addEventListener("popstate", updateRoutes);

export function renderRoute(obj, children) {
  let fallback = null,
    el = null,
    current;

  const scripts = Components.context.scripts,
    component = scripts[obj.component],
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
    obj.Children = {
      "#isComponent": false,
      "#isChild": true,
      dom: children,
    };

    fallback = DismatchedComment();
    checkMatchedStr(paths, isExact) && (el = render(component.current, props));

    Listeners.add(function () {
      if (checkMatchedStr(paths, isExact)) {
        if (current === el) return;
        el === null && (el = render(component.current, props));
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
  const el = handleElement(["a", obj, []]),
    href = () => el.getAttribute("href"),
    title = el.title || document.title;

  el.adopt(children).addEventListener("click", function (e) {
    e.preventDefault();
    const link = href();
    if (link === document.location.pathname) return;
    window.history.pushState(obj.state || { state: title }, title, link);
    updateRoutes();
  });

  if (checkMatchedStr(href(), true)) {
    document.title = title;
    el.classList.add("currentActiveLink");
  }

  Listeners.add(function () {
    if (checkMatchedStr(href(), true)) {
      document.title = title;
      el.classList.add("currentActiveLink");
      return;
    }
    el.classList.remove("currentActiveLink");
  });

  return el;
}

const Routes = new Map();
export function renderSwitch(children) {
  const placeHolder = new Text("");
  // {active: Boolean, update:Function}
  return;
}
