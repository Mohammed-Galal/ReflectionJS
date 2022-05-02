const availDataTypes = ["string", "number", "boolean", "symbol"];

export default function schema(type, defaultValue) {
  let typeIsAvails = null;

  availDataTypes.forEach(function ($) {
    if ($ === type) typeIsAvails = type;
  });
  if (typeIsAvails === null) throw "the type must be Primitive";

  const result = {
    current: (function () {
      if (typeof defaultValue !== typeIsAvails)
        throw "the given value must match one of the primitive dataTypes";
      return defaultValue;
    })(),
    update: function (val) {
      if (typeof val !== typeIsAvails)
        throw "the given value must match one of the primitive dataTypes";

      if (this.current === val) return;
      this.current = val;
    },
  };
  result[Symbol("#schema")] = true;
  return result;
}
