Node.prototype["#deps"] = [];
HTMLElement.prototype.adopt = function (node) {
  const el = this;
  if (node instanceof Array) node.forEach(el.adopt.bind(el));
  else {
    el.appendChild(node);
    node["#deps"].forEach(el.adopt.bind(el));
  }
  return this;
};

Node.prototype.replace = function (newNode) {
  if (this === newNode) return newNode;
  if (newNode instanceof Array) newNode.forEach(this.replace.bind(this));
  else {
    this["#deps"].forEach(function reCall($) {
      newNode.remove($);
      $["#deps"].forEach(reCall);
    });

    this.replaceWith(newNode);
    newNode["#deps"].reverse().forEach(function reCall($) {
      newNode.after($);
      $["#deps"].reverse().forEach(reCall);
    });
  }
  return newNode;
};
