// module.exports = function (str) {
export default function (str) {
  return str
    .split(/(?={\d+})|(?<={\d+})/g)
    .map(($) => ($[0] === "{" ? Number($.slice(1, -1)) : $.trimStart()))
    .filter(($) => $ !== "");
}
