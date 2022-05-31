import render from "./exact/client/index.js";
import { useBatch, useState } from "./exact/client/hooks.js";

const listOfComponents = [
  {
    "#isComponent": true,
    _id: 3,
    scripts: [],
    components: [],
    dom: ["Link", { href: "/", key: "Root" }, ["Root"]],
  },
  {
    "#isComponent": true,
    _id: 3,
    scripts: [],
    components: [],
    dom: ["Link", { href: "/about/dd", key: "Two" }, ["Two"]],
  },
  {
    "#isComponent": true,
    _id: 3,
    scripts: [],
    components: [],
    dom: [
      "Link",
      { href: "/index.html", key: "index page", title: "index page" },
      ["index.html"],
    ],
  },
];

function App({ path, Children }) {
  const [txt, setTxt] = useState(true);

  return {
    "#isComponent": true,
    _id: 1,
    scripts: [txt, () => setTxt(!txt)],
    components: [Children],
    dom: ["h1", { onClick: 1, "exact:path": path }, [0, " ", [0, {}, []]]],
  };
}

render(() => {
  const [x, y] = useState(true),
    [a, b] = useState(1);

  // const ev = function () {
  //   y(!x);
  //   b(a + 1);
  // };
  const ev = useBatch(function () {
    y(!x);
    b(a + 1);
  });

  console.log(x, a);

  return {
    "#isComponent": true,
    _id: 0,
    components: [App],
    scripts: [listOfComponents, ev],
    dom: ["main", { onClick: 1 }, [0, [0, {}, ["im a Child "]], "deijodij"]],
  };
}, "#root");
