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
  const placeHolder = new Text("");

  const scripts = Components.context.scripts,
    component = scripts[obj.component],
    isExact = "exact:paths" in obj,
    key = isExact ? "exact:paths" : "paths",
    paths = typeof obj[key] === "number" ? scripts[obj[key]].current : obj[key];

  let isActive = checkMatchedStr(paths, isExact);
  if (component === undefined) {
    isActive && (placeHolder["#deps"] = children);

    Listeners.add(function () {
      isActive = checkMatchedStr(paths, isExact);
      if (isActive) {
        placeHolder["#deps"].forEach(($) => placeHolder.before($));
        placeHolder["#deps"] = children;
      } else {
        placeHolder["#deps"].forEach(($) => $.remove());
        placeHolder["#deps"] = [];
      }
    });
  } else {
    const props = {
      targetedRoutes: { paths, isExact },
      Children: {
        "#isComponent": false,
        "#isChild": true,
        dom: children,
      },
    };

    let cachedEL = null;
    if (isActive) {
      props.location = new URL(document.location);
      props.location.params = isActive.groups;
      cachedEL = render(component.current, function () {
        return props;
      });
      placeHolder["#deps"] = [cachedEL];
    }

    Listeners.add(function () {
      isActive = checkMatchedStr(paths, isExact);
      if (isActive) {
        props.location = new URL(document.location);
        props.location.params = isActive.groups;

        cachedEL === null &&
          (cachedEL = render(component.current, function () {
            return props;
          }));
        placeHolder.before(cachedEL);
        placeHolder["#deps"] = [cachedEL];
      } else {
        placeHolder["#deps"][0].remove();
        placeHolder["#deps"] = [];
      }
    });
  }

  return SwitchOn
    ? {
        get isActive() {
          return isActive;
        },
        get current() {
          return current;
        },
      }
    : placeHolder;
}

function renderSwitch($children) {
  const fallback = new Text("");
  let currentRoute = fallback;

  SwitchOn = true;
  const children = $children
    .map(handleNode)
    .filter(($) => !($ instanceof Node));
  SwitchOn = false;

  let result = children.find((el) => el.isActive);
  if (result) currentRoute = result.current;

  Listeners.add(function () {
    result = children.find((el) => el.isActive);
    if (result) {
      currentRoute.replace(fallback);
      currentRoute = result.current;
      return;
    }
  });

  return currentRoute;
}
