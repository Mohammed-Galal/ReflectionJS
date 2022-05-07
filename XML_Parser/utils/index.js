const isScriptTag = (str) => /^{|}$/g.test(str),
  isTxtContent = (str) => /^>/g.test(str),
  isOpenTag = (str) => /<(?!\/)/g.test(str),
  isEndTag = (str) => /^(\/|<\/)/g.test(str);

const translateFragmentsExp = /<>|<\/>/g,
  contentSplitter = /(?=<[\w\/])|(?=[>{])|(?=\/>)|(?<=})/g;

module.exports = function (txt) {
  const afterFragmentsSet = String(txt).replace(
    translateFragmentsExp,
    (m) => (m === "<>" ? "<" : "</") + "Fragment>"
  );
  return handleContentChunks(afterFragmentsSet.split(contentSplitter));
};

let key = 0;
function handleContentChunks(arr) {
  const roots = [];

  // let isElOpen = false;
  let currentContainerMethods = null;
  const Content = arr.map((str) => {
    if (isOpenTag(str)) {
      if (currentContainerMethods === null) {
        createRoot(handleOpenTags(str));
        return roots.length - 1;
      }
      currentContainerMethods.appendEl(str);
    }
    if (currentContainerMethods === null) return str;
    else if (isEndTag(str)) {
      currentContainerMethods.endEl(str[0] === "/");
      if (currentContainerMethods === null) return roots[roots.length - 1];
    } else if (isScriptTag(str)) currentContainerMethods.handleScripts(str);
    currentContainerMethods.appendTxt(str);
    return false;
  });

  function createRoot([tag, attrs]) {
    const obj = {
      scripts: [],
      components: [],
      dom: [[tag, attrs, []]],
    };

    roots.push(obj);

    let scriptsHolder = [],
      scriptsCounter = 0;

    currentContainerMethods = {
      appendEl(str) {
        if (scriptsCounter > 0) return scriptsHolder.push(str);
        const [tag, attrs] = handleOpenTags(str);
        obj.dom.push([tag, attrs, []]);
      },
      appendTxt(txt) {
        if (scriptsCounter > 0) return scriptsHolder.push(str);
        obj.dom[obj.dom.length - 1][2].push(handleText(txt));
      },
      endEl(isSelfClosed) {
        if (scriptsCounter > 0) return scriptsHolder.push(str);
        const domLen = obj.dom.length,
          targetEl = obj.dom[domLen - 2];
        isSelfClosed && (targetEl[1].isSelfClosed = isSelfClosed);
        if (domLen > 1) {
          const childEl = obj.dom[domLen - 1];
          targetEl[2].push(childEl);
          return obj.dom.pop();
        }
        isElOpen = false;
        currentContainerMethods = null;
      },
    };
  }
}

function handleOpenTags(str) {
  return [tag, attr];
}

function handleText(str) {
  return str[0] === ">" ? String(str).slice(1) : str;
}
