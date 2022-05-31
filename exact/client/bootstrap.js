Node.prototype["#deps"] = [];

HTMLElement.prototype.adopt = function reCall(node) {
  const el = this;
  el.appendChild(node);
  node["#deps"].forEach(($) => node.spreadBefore($));
  return this;
};

Node.prototype.replace = function (newNode) {
  if (this === newNode) return newNode;
  this["#deps"].forEach(($) => $.deepRemove());
  this.replaceWith(newNode);
  newNode["#deps"].forEach(($) => newNode.spreadBefore($));
  return newNode;
};

Node.prototype.deepRemove = function () {
  this["#deps"].forEach(($) => $.deepRemove());
  this.remove();
};

Node.prototype.spreadBefore = function (node) {
  const parent = this.parentElement;
  parent.insertBefore(node, this);
  node["#deps"].forEach(($) => node.spreadBefore($));
};
