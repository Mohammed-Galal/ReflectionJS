function replacer(m) {
  return "(?<" + m.slice(1) + ">\\w+)(\\.\\w+)*";
}
export const checkMatchedStr = function ($str, isExact) {
    if ($str === undefined) return true;

    const isArray = $str instanceof Array,
      str = isArray
        ? $str.map(replacer)
        : $str.replace(/:(?<param>\w+)/g, replacer);

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
    return /^(Switch|Route|Link|)$/.test(tag);
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
