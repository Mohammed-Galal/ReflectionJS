module.exports = function (arr, components) {
  const [tag, ...attrs] = arr,
    result = [tag, null, []];

  handling_Attrs: {
    if (attrs.length > 0) {
      result[1] = {};
      arr.slice(1).forEach(($) => {
        const [prop, val] = $.split("="),
          attr = /{\d+}/g.test(val) ? val.slice(1, -1) : val;
        result[1][prop] = new Function("return " + attr)();
      });
    }
  }

  handling_Tags_And_Components: {
    if (/[A-Z]/.test(tag[0])) {
      const isExisted = components.indexOf(tag);
      if (isExisted === -1) {
        const currentComponentIndex = components.length;
        components[currentComponentIndex] = tag;
        result[0] = currentComponentIndex;
      } else result[0] = isExisted;
    }
  }
  return result;
};
