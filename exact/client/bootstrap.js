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
  const parent = this.parentElement;
  this["#deps"].forEach(($) => parent.removeChild($));
  parent.replaceChild(this, newNode);
  newNode["#deps"].reverse().forEach(($) => newNode.after($));
  return newNode;
};
