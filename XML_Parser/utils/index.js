const checkIfOpenScriptTag = (str) => /^{/.test(str),
  checkIfEndScriptTag = (str) => /}$/.test(str),
  checkIfOpenTag = (str) => /^<\w/.test(str),
  checkIfEndTag = (str) => /<\/\w+>$|\/>$/.test(str),
  checkIsEndTag = (str) => /^(\/|<\/\w)/.test(str);

const fillFragmentsExp = /<>|<\/>/g,
  contentSplitter = /(?=<\w)|(?<=>)/g;
module.exports = function (file) {
  return handleTextContent(
    String(file).replace(
      fillFragmentsExp,
      (m) => (m === "<>" ? "<" : "</") + "Fragment>"
    )
  );
};

function handleTextContent(text) {
  const arr = text.split(contentSplitter),
    endPos = arr.length;

  const roots = [],
    contentWithoutRoots = [];

  let strHolder = [];
  countOfOpenEls = 0;

  var currentIndex = 0;
  while (currentIndex < endPos) {
    const str = arr[currentIndex],
      isOpenTag = checkIfOpenTag(str),
      isEndTag = checkIfEndTag(str);
    currentIndex++;

    if (isOpenTag) countOfOpenEls++;

    const targetArr = countOfOpenEls === 0 ? contentWithoutRoots : strHolder;
    targetArr.push(str);

    if (countOfOpenEls > 0 && isEndTag) {
      countOfOpenEls--;
      if (countOfOpenEls === 0) {
        const Len = roots.length;
        roots.push(strHolder.join(""));
        strHolder = [];
        contentWithoutRoots.push(Len);
      }
    }
  }

  return contentWithoutRoots
    .map(($) => (typeof $ === "number" ? parser(roots[$]) : $))
    .join("");
}

const rootSplitExp = /(?=<\w)|(?=\/>)|(?=>)|(?=<\/\w)|(?={)|(?<=})/g;
let key = 0;
function parser(root) {
  const arr = root.split(rootSplitExp),
    endPos = arr.length;

  const currentKey = key,
    scripts = [],
    components = [];
  key++;

  const Contexts = {
    active: [],
    get current() {
      return this.active[this.active.length - 1];
    },
    addContext(Context) {
      this.active.push(Context);
    },
    pop() {
      this.active.pop();
    },
  };

  let strHolder = [],
    countOfOpenScript = 0;

  var currentIndex = 0;
  while (currentIndex < endPos) {
    const str = arr[currentIndex],
      isOpenScript = checkIfOpenScriptTag(str),
      isEndScript = checkIfEndScriptTag(str),
      isThereOpenScript = countOfOpenScript > 0;
    currentIndex++;

    if (isOpenScript) countOfOpenScript++;
    else if (isThereOpenScript && isEndScript) countOfOpenScript--;

    if (isThereOpenScript) {
      strHolder.push(str);

      if (countOfOpenScript === 0) {
        const result = strHolder.join("").slice(1, -1),
          isScriptExist = scripts.indexOf(result);

        if (isScriptExist !== -1) Contexts.current.appendText(isScriptExist);
        else {
          const scriptIndex = scripts.length;
          scripts[scriptIndex] = result;
          Contexts.current.appendText(scriptIndex);
        }
      }

      continue;
    }

    const isOpenTag = checkIfOpenTag(str),
      isEndTag = checkIsEndTag(str);

    if (isOpenTag) _createContext(str);
    else if (isEndTag) Contexts.current.revoke();
    else Contexts.current.appendText(str);
  }

  function _createContext(str) {
    const parent = Contexts.current,
      [tag, attrs] = handleOpenTags(str),
      children = [];

    Contexts.add({
      get el() {
        return [tag, attrs, children];
      },
      appendEl(el) {
        children.push(el);
      },
      appendText(txt) {
        const result = txt[0] === ">" ? String(txt).slice(1) : txt;
        children.push(result);
      },
      revoke() {
        if (Contexts.active.length === 1) return;
        parent.appendEl(this.el);
        Contexts.pop();
      },
    });
  }

  function handleOpenTags(str) {
    const sliced = str.slice(1).split(/\s+(?=\S+=["'{])/),
      tag = sliced[0],
      attrsTxts = sliced.slice(1),
      attrs = {};
  }

  return `{
    "#isComponent":true,
    _id: ${currentKey},
    scripts: [${scripts}],
    components: [${components}],
    dom: ${JSON.stringify(Contexts.active.el)}
  }`;
}
