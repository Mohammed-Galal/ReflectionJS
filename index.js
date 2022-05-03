import render from "./exact/client/index.js";
import { useState } from "./exact/client/hooks.js";

const listOfComponents = [
  {
    "#isComponent": true,
    key: "One",
    _id: 3,
    scripts: [],
    components: [],
    dom: ["Link", { href: "/" }, ["One"]],
  },
  {
    "#isComponent": true,
    key: "Two",
    _id: 3,
    scripts: [],
    components: [],
    dom: ["Link", { href: "/depoik" }, ["Two"]],
  },
  {
    "#isComponent": true,
    key: "Three",
    _id: 3,
    scripts: [],
    components: [],
    dom: [
      "Link",
      { href: "/index.html", title: "index page" },
      [["", {}, ["index.html"]]],
    ],
  },
];

function App({ Children }) {
  const [txt, setTxt] = useState(true);

  return {
    "#isComponent": true,
    _id: 1,
    scripts: [txt, () => setTxt(!txt)],
    components: [Children],
    dom: ["h1", { onClick: 1 }, [0, " ", [0, {}, []]]],
  };
}

render(
  {
    "#isComponent": true,
    _id: 0,
    components: [],
    scripts: [App, listOfComponents],
    dom: [
      "div",
      {},
      [
        1,
        [
          "Route",
          { paths: "/index.html", component: 0 },
          ["im a Child", "poipo", "kpokpo"],
        ],
      ],
    ],
  },
  "root"
);
