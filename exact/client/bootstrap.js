Node.prototype["#deps"] = [];
let cout = 0;
HTMLElement.prototype.adopt = function reCall(node) {
  const el = this;
  if (node instanceof Array) return node.forEach(reCall.bind(el));
  el.appendChild(node);
  node["#deps"].forEach(reCall.bind(el));
  return this;
};

Node.prototype.replace = function (newNode) {
  if (this === newNode) return newNode;
  // if (newNode instanceof Array) newNode.forEach(this.replace.bind(this));
  // else {
  this["#deps"].forEach(function ($) {
    $.deepRemove();
  });

  this.replaceWith(newNode);
  newNode["#deps"].forEach(function reCall($) {
    newNode.before($);
    $["#deps"].forEach(reCall);
  });
  // }
  return newNode;
};

Node.prototype.deepRemove = function () {
  this["#deps"].forEach(($) => $.deepRemove());
  this.remove();
};
