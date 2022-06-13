const premitiveVals = ["string", "number", "boolean"];

function replacer(str) {
  return String(str).replace(
    /:(?<param>\w+)/g,
    (m) => "(?<" + m.slice(1) + ">\\w+)"
  );
}
export const isPremitive = function (val) {
    return premitiveVals.some(($) => typeof val === $);
  },
  checkMatchedStr = function ($str, isExact) {
    if ($str === undefined) return true;

    const isArray = $str instanceof Array,
      str = isArray ? $str.map(replacer) : replacer($str);

    if (isArray) return str.some(checkMatchedStr);
    const currentLocation = document.location.pathname,
      regExp = isExact ? "^" + str + "$" : "^" + str;
    return new RegExp(regExp).exec(currentLocation);
  },
  scriptify = function (val) {
    return {
      current: val,
      deps: [],
    };
  },
  isCustomTag = function (tag) {
    return /^(Switch|Route|Link|Fragment)$/.test(tag);
  },
  encodeHTML = function (node) {
    return String(node).replace(/&#60;|&#62;/, function (m) {
      return m === "&#60;" ? "<" : ">";
    });
  };

/**
 * @function checkMatchedStr
 * @param {URL} str
 * @param {Bool} isExact
 * @returns true: if the current window Location matches the URL specified
 */
