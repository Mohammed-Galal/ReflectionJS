export const checkMatchedStr = function (str, isExact) {
    str = str || document.location.pathname;
    if (str instanceof Array) return str.some(checkMatchedStr);
    const currentLocation = document.location.pathname,
      regExp = isExact ? "^" + str + "$" : "^" + str;
    return new RegExp(regExp).test(currentLocation);
  },
  scriptify = function (val) {
    return {
      current: val,
      deps: [],
    };
  },
  checkIfCustomTag = function (tag) {
    return /^(|Route|Switch|Link)$/.test(tag);
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
