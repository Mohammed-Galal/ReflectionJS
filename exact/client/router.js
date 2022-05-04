import { checkMatchedStr } from "./utils.js";
import { Components, render, handleElement, handleNode } from "./index.js";

const Listeners = new Set(),
  updateRoutes = function () {
    Listeners.forEach(($) => $());
  },
  DismatchedComment = () => new Text("");

window.addEventListener("popstate", updateRoutes);

export default function handleCustomElements(tag, props, children) {
  switch (tag) {
    case "Switch":
      return renderSwitch(children);
    case "Route":
      return renderRoute(props, children.map(handleNode));
    case "Link":
      return renderLink(props, children.map(handleNode));
    default:
      const TXT = new Text("");
      TXT["#deps"] = children.map(handleNode);
      return TXT;
  }
}

let SwitchOn = false;
function renderRoute(obj, children) {
  let fallback = null,
    el = null,
    current;

  const scripts = Components.context.scripts,
    component = scripts[obj.component],
    isExact = "exact:paths" in obj,
    key = isExact ? "exact:paths" : "paths",
    paths = typeof obj[key] === "number" ? scripts[obj[key]].current : obj[key];

  let isActive = checkMatchedStr(paths, isExact);
  if (component === undefined) {
    fallback = children.map(DismatchedComment);

    Listeners.add(function () {
      isActive = checkMatchedStr(paths, isExact);
      if (isActive) {
        if (current === children) return;
        current.forEach(($, ind) => $.replace(children[ind]));
        current = children;
      } else {
        if (current === fallback) return;
        current.forEach(($, ind) => $.replace(fallback[ind]));
        current = fallback;
      }
    });

    current = isActive ? children : fallback;
  } else {
    const props = {
      targetedRoutes: { paths, isExact },
      Children: {
        "#isComponent": false,
        "#isChild": true,
        dom: children,
      },
    };

    fallback = DismatchedComment();

    if (isActive) {
      props.location = new URL(document.location);
      props.location.params = isActive.groups;
      el = render(component.current, function () {
        return props;
      });
    }

    Listeners.add(function () {
      isActive = checkMatchedStr(paths, isExact);
      if (isActive) {
        if (current === el) return;
        props.location = new URL(document.location);
        props.location.params = isActive.groups;
        el === null &&
          (el = render(component.current, function () {
            return props;
          }));
        current.replace(el);
        current = el;
      } else {
        if (current === fallback) return;
        current.replace(fallback);
        current = fallback;
      }
    });

    current = el || fallback;
  }

  return SwitchOn ? { "#isRoute": true, isActive, current } : current;
}

function renderLink(obj, children) {
  const el = handleElement(["a", obj, []]),
    href = () => el.getAttribute("href"),
    title = () => el.title || document.title;

  el.adopt(children).addEventListener("click", function (e) {
    e.preventDefault();
    const link = href();
    if (link === document.location.pathname) return;
    window.history.pushState(obj.state || { state: title() }, title(), link);
    updateRoutes();
  });

  if (checkMatchedStr(href(), true)) {
    document.title = title();
    el.classList.add("currentActiveLink");
  }

  Listeners.add(function () {
    if (checkMatchedStr(href(), true)) {
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

  SwitchOn = true;
  placeHolder["#deps"] = children.map(handleNode);
  SwitchOn = false;

  return placeHolder["#deps"];
}
