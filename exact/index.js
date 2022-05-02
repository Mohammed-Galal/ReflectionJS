// import clientRender from "./client/index.js";
import clientRender from "./client/router.js";

export default function (root, target) {
  if (typeof root === "function")
    throw "the root Component must not be a function";
  if (!root["#isComponent"]) return "the root element is not a JSX Component";

  const result = clientRender(root);
  if (result instanceof Array)
    return result.forEach(function (n) {
      return target.appendChild(n);
    });
  return target.appendChild(result);
}
