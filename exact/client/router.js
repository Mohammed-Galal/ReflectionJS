import { checkMatchedStr } from "./utils.js";
import { Components, render, handleElement, handleNode } from "./index.js";

const Listeners = new Set(),
  updateRoutes = function () {
    Listeners.forEach(($) => $());
  };

window.addEventListener("popstate", updateRoutes);

export default function handleCustomElements(tag, props, children) {
  switch (tag) {
    case "Switch":
      return renderSwitch(children);
    case "Route":
      return renderRoute(props, children.map(handleNode));
    case "Link":
      return renderLink(props, children);
    default:
      const TXT = new Text("");
      TXT["#deps"] = children.map(handleNode);
      return TXT;
  }
}

function renderLink(obj, children) {
  const el = handleElement(["a", obj, children]),
    href = () => el.getAttribute("href"),
    title = () => el.title || document.title;

  el.addEventListener("click", function (e) {
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

let SwitchOn = false;
function renderRoute(obj, children) {
  const placeHolder = new Text();

  const scripts = Components.context.scripts,
    component = scripts[obj.component],
    isExact = "exact:paths" in obj,
    key = isExact ? "exact:paths" : "paths",
    paths = typeof obj[key] === "number" ? scripts[obj[key]].current : obj[key];

  let isActive = checkMatchedStr(paths, isExact);
  if (component === undefined) {
    if (SwitchOn || isActive) placeHolder["#deps"] = children;

    if (SwitchOn)
      return {
        get isActive() {
          return checkMatchedStr(paths, isExact);
        },
        current: placeHolder,
      };

    !SwitchOn &&
      Listeners.add(function () {
        isActive = checkMatchedStr(paths, isExact);
        if (isActive) {
          placeHolder["#deps"].forEach(($) => placeHolder.spreadBefore($));
          placeHolder["#deps"] = children;
        } else {
          placeHolder["#deps"].forEach(($) => $.deepRemove());
          placeHolder["#deps"] = [];
        }
      });
  } else {
    const props = {
      targetedRoutes: { paths, isExact },
      get location() {
        const LOC = new URL(document.location);
        LOC.params = isActive.groups;
        return LOC;
      },
      Children: {
        "#isComponent": false,
        "#isChild": true,
        dom: children,
      },
    };

    let cachedEL = null;
    if (SwitchOn || isActive) {
      cachedEL = render(component.current, function () {
        return props;
      });

      placeHolder["#deps"] = [cachedEL];
    }

    if (SwitchOn)
      return {
        get isActive() {
          return checkMatchedStr(paths, isExact);
        },
        get current() {
          return cachedEL;
        },
      };

    Listeners.add(function () {
      isActive = checkMatchedStr(paths, isExact);
      if (isActive) {
        cachedEL === null &&
          (cachedEL = render(component.current, function () {
            return props;
          }));
        placeHolder.spreadBefore(cachedEL);
        placeHolder["#deps"] = [cachedEL];
      } else {
        placeHolder["#deps"].forEach(($) => $.deepRemove());
        placeHolder["#deps"] = [];
      }
    });
  }

  return placeHolder;
}

function renderSwitch($children) {
  const fallback = new Text();
  let currentRoute = null;

  SwitchOn = true;
  const children = $children
    .map(handleNode)
    .filter(($) => !($ instanceof Node));
  SwitchOn = false;

  const firstMatched = children.find((el) => el.isActive);
  currentRoute = firstMatched ? firstMatched.current : fallback;

  Listeners.add(function () {
    const newRoute = children.find((el) => el.isActive);
    if (newRoute) {
      currentRoute.replace(newRoute.current);
      currentRoute = newRoute.current;
      return;
    }
    currentRoute.replace(fallback);
    currentRoute = fallback;
  });

  return currentRoute;
}
