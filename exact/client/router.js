import { checkMatchedStr } from "./utils.js";
import { handleSingleNode, Components, render, attachAttrs } from "./index.js";

const Routes = new Set(),
  DismatchedComment = () => new Text("");

window.addEventListener("popstate", () => Routes.forEach(($) => $()));

export function renderRoute(obj, $children) {
  let fallback = null,
    el = null,
    current;

  const scripts = Components.context.scripts,
    component = scripts[obj.component],
    children = $children.map(handleSingleNode),
    props = function () {
      return obj;
    },
    isExact = "exact:paths" in obj,
    key = isExact ? "exact:paths" : "paths",
    paths = typeof obj[key] === "number" ? scripts[obj[key]].current : obj[key];

  if (component === undefined) {
    fallback = children.map(DismatchedComment);

    Routes.add(function () {
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

    Routes.add(function () {
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
  const href = obj.href,
    title = obj.title,
    el = document.createElement("a");

  function setStateOFAnchor() {
    if (checkMatchedStr(href, true)) {
      title && (document.title = title);
      el.classList.add("currentActive");
    }
    el.classList.remove("currentActive");
  }

  setStateOFAnchor();
  Routes.add(setStateOFAnchor);

  el.addEventListener("click", function (e) {
    e.preventDefault();
    window.history.pushState(
      { page: href },
      title || document.location.pathname,
      href
    );
    Routes.forEach(($) => $());
  });

  attachAttrs(obj, el);
  children.map(handleSingleNode).forEach(function attachChildren(node) {
    if (node instanceof Array) return node.forEach(attachChildren);
    return el.appendChild(node);
  });

  return el;
}

export function renderSwitch(obj, children) {}
