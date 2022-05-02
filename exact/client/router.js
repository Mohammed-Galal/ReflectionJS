import { handleSingleNode, Components, render } from "./index.js";
import { checkMatchedStr } from "./utils.js";

const Routes = new Set();

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

  return current;
}

export function renderLink(obj, children) {
  const scripts = Components.context.scripts,
    href = obj.href,
    title = obj.pageTitle || document.title,
    el = document.createElement("a");

  el.href = href;

  function setStateOFAnchor() {
    el.setAttribute("data-active", checkMatchedStr(href, true));
  }

  setStateOFAnchor();
  Routes.add(setStateOFAnchor);

  Object.keys(obj).forEach(function ($) {
    if (/^(pageTitle|href)&/.test($)) return;
    if (typeof obj[$] !== "number") return (el[$] = obj[$]);

    function resetter() {
      el[$] = scripts[obj[$]].current;
    }
    resetter();
    el[$] = scripts[obj[$]].deps.push(resetter);
  });

  el.addEventListener("click", function (e) {
    this.download = "/index.js";
    e.preventDefault();
    document.title = title;
    window.history.pushState({ page: href }, title, href);
    Routes.forEach(($) => $());
  });

  children.map(handleSingleNode).forEach(($) => el.appendChild($));

  return el;
}
