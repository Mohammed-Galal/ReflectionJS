const handleNewEl = require("./handleNewElement"),
  parseStrings = require("./parseStrings");

const rootElementCatcher = /<(?<name>(\w+)?)[^]+?<\/(\k<name>)>|<\S[^]+\/>/g,
  scriptsCatcher = /(?={)|(?=})|(?<=})/g,
  splitExp = /<(?=\/)|(?=<)|(?<!\/)>|\s*(?=\/>)|(?<=\/>)/g;

let key = 0;
module.exports = I;

function I(txt) {
  // .replace(/<>|<\/>/g, (m) => (m === "<>" ? "<fragment>" : "</fragment>"))
  return txt.replace(rootElementCatcher, parser);
}

function parser(match) {
  const currentDOMKey = key;
  key++;

  let scripts = [],
    components = [];

  match = extractScript(scripts, match);

  const domArray = match.split(splitExp).filter(Boolean),
    DOMResult = [];

  domArray.forEach(($) => {
    if ($[0] === "<") {
      const sliced = $.slice(1).split(/\s+(?=\S+=["'{])/),
        EL = handleNewEl(sliced, components);
      return DOMResult.unshift(EL);
    } else if ($[0] === "/") {
      // console.log($ === "/>", DOMResult[0][1]);
      try {
        DOMResult[1][2].push(DOMResult[0]);
        return DOMResult.shift();
      } catch {
        return;
      }
    } else {
      $ = parseStrings($);
      if ($.length === 1) return DOMResult[0][2].push($[0]);
      $.forEach(($i) => DOMResult[0][2].push($i));
    }
  });

  return (
    '{"#isComponent":true,key:' +
    currentDOMKey +
    ",scripts:[" +
    scripts.map(I) +
    "]" +
    ",components:[" +
    components +
    "]" +
    ",dom:" +
    JSON.stringify(DOMResult[0]) +
    "}"
  );
}

let holder = "",
  counter = 0;
function extractScript(scripts, txt) {
  const splited = txt.split(scriptsCatcher),
    allInAll = [];

  splited.forEach(($) => {
    const isOpenTag = $[0] === "{",
      isClosingTag = $ === "}";

    if (!isOpenTag && !isClosingTag && counter === 0) return allInAll.push($);

    holder += $;

    if (isOpenTag) {
      counter++;
    } else if (isClosingTag) {
      if (counter === 1) {
        const finalResult = holder.slice(1, -1),
          isExisted = scripts.indexOf(finalResult);
        if (isExisted === -1) {
          const currentIndex = scripts.length;
          scripts.push(finalResult);
          allInAll.push("{" + currentIndex + "}");
        } else {
          allInAll.push("{" + isExisted + "}");
        }
        holder = "";
      }
      counter--;
    }
  });
  return allInAll.join("").replace(/[\r\t\n]+|(?<=\s)\s+/g, "");
}
