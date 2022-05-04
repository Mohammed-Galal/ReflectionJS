Node.prototype["#deps"] = [];
HTMLElement.prototype.adopt = function (node) {
  if (node instanceof Array) node.forEach(this.adopt.bind(this));
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
  newNode["#deps"].reverse().forEach(($) => newNode.after($));
  return newNode;
};
