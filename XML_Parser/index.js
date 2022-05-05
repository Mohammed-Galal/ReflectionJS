// const parse = require("./utils/parser");
import parse from "./utils/parser.js";
import fs from "fs";

// const fs = require("fs"),
const xmlTxt = fs.readFileSync("./index.jsx", "utf-8");

const result = parse(xmlTxt);

fs.writeFileSync("./result.js", result);

// console.log(result);
// .match(/<main>[\s\S]+<\/main>/g)[0]
// .replace(/<!--|-->/g, function (m) {
//   if (m === "<!--") return "<comment>";
//   return "</comment>";
// });

// String.prototype.truncate = function () {
//   return this.replace(/\s+/g, " ");
// };

// const openTags = "<[^\\s/>]+", //  ==>  <Tag
//   endTags = "(?<=<)/|/(?=>)", //  ==>  /
//   // attrs = "\\S+=[\"'][^]+[\"']", //  ==> attr="val"
//   attrs = "[^\\s]+=[\"'][^]+?[\"']\\s*(?=\\w|[-@($!/>])", //  ==> attr="val"
//   texts = ">[^]*?(?=<[\\w/])"; //  ==> >text

// const combined = [openTags, endTags, attrs, texts].join("|"),
//   regExp = new RegExp(combined, "g");

// function parser($txt) {
//   const matches = $txt.match(regExp),
//     lastIndex = matches.length - 1;

//   const map = [];

//   matches.forEach(function ($, i) {
//     if ($[0] === "<") {
//       const obj = { tag: $.slice(1), attr: {}, children: [] };
//       map.unshift(obj);
//     } else if ($[0] === ">") {
//       const sliced = $.slice(1);
//       if (!Boolean(sliced.trim())) return;

//       const obj = {
//         tag: "text",
//         content: sliced.truncate().split(/(?={{)|(?<=}})/g),
//       };
//       map[0].children.push(obj);
//     } else if ($ === "/") {
//       if (i < lastIndex) {
//         map[1].children.push(map[0]);
//         map.shift();
//       }
//     } else {
//       const result = $.replace(/\s+(?=\S+=["'])/g, "&");

//       Object.assign(
//         map[0].attr,
//         Object.fromEntries(new URLSearchParams(result))
//       );
//     }
//   });

//   return map[0];
//   // return JSON.stringify(map[0], null, 1);
// }

// console.log(JSON.stringify(parser(xmlTxt), null, 1));
// // console.log(parser(xmlTxt));
