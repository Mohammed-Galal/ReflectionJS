Node.prototype["#deps"] = [];
HTMLElement.prototype.adopt = function (node) {
  if (node instanceof Array) node.forEach(this.adopt.bind(this));
  else {
    this.appendChild(node);
    node["#deps"].forEach(this.adopt.bind(this));
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

    const parent = this.parentElement;
    this.replaceWith(newNode);
    newNode["#deps"].forEach(function reCall($) {
      parent.insertBefore(newNode, $);
      $["#deps"].forEach(reCall);
    });
  }
  return newNode;
};
