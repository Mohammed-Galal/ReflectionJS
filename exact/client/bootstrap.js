Node.prototype["#deps"] = [];
HTMLElement.prototype.adopt = function reCall(node) {
  if (node instanceof Array) node.forEach(reCall.bind(this));
  else {
    const el = this;
    this.appendChild(node);
    node["#deps"].forEach(($) => el.adopt($));
  }
  return this;
};

Node.prototype.replace = function (newNode) {
  if (this === newNode) return newNode;
  const parent = this.parentElement;
  this["#deps"].forEach(($) => parent.removeChild($));
  parent.replaceChild(this, newNode);
  newNode["#deps"].forEach(($) => newNode.after($));
  return newNode;
};
