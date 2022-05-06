module.exports = function (arr, components) {
  const [tag, ...attrs] = arr,
    result = [tag, {}, []];

  if (attrs.length > 0) {
    arr.slice(1).forEach(($) => {
      const [prop, val] = $.split("="),
        attr = /{\d+}/g.test(val) ? val.slice(1, -1) : val;
      result[1][prop] = new Function("return " + attr)();
    });
  }

  if (/^[A-Z]/.test(tag) && !/^(switch|route|link|)$/i.test(tag)) {
    const isExisted = components.indexOf(tag);
    if (isExisted === -1) {
      const currentComponentIndex = components.length;
      components[currentComponentIndex] = tag;
      result[0] = currentComponentIndex;
    } else result[0] = isExisted;
  }

  return result;
};
