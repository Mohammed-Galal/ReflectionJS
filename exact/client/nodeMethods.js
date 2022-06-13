Node.prototype["#deps"] = [];

export default function $(el) {
  const obj = {
    el: el,
    append(node) {
      el.appendChild(node);
      $(node).before(node["#deps"]);
      return obj;
    },

    before(node) {
      if (node instanceof Array)
        node.forEach((innerNode) => $(el).before(innerNode));
      else {
        el.parentElement.insertBefore(node, el);
        $(node).before(node["#deps"]);
      }
      return obj;
    },

    replaceWith(node) {
      const parent = el.parentElement,
        deps = el["#deps"];

      if (parent !== null) {
        deps.forEach((innerNode) => $(innerNode).remove());
        parent.replaceChild(node, el);
        $(node).before(node["#deps"]);
      }

      return obj;
    },

    replaceDeps(newList) {
      const oldList = el["#deps"],
        oldLen = oldList.length,
        newLen = newList.length,
        endPos = oldLen > newLen ? oldLen : newLen;

      let index = 0;
      while (index < endPos) {
        const oldC = oldList[index],
          newC = newList[index];
        index++;

        if (oldC === undefined) this.before(newC);
        else if (newC === undefined) $(oldC).remove();
        else $(oldC).replaceWith(newC);
      }

      el["#deps"] = newList;
      return obj;
    },

    remove() {
      const parent = el.parentElement,
        deps = el["#deps"];
      if (parent !== null) {
        deps.forEach((innerNode) => $(innerNode).remove());
        parent.removeChild(el);
      }
      return obj;
    },
  };

  return obj;
}
