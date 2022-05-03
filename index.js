import render from "./exact/client/index.js";
import { useState } from "./exact/client/hooks.js";

const listOfComponents = [
  {
    "#isComponent": true,
    _id: 3,
    scripts: [],
    components: [],
    dom: ["p", { key: "lst" }, ["test list of components 1"]],
  },
  {
    "#isComponent": true,
    _id: 4,
    scripts: [],
    components: [],
    dom: ["p", { key: "2nd" }, ["test list of components 2"]],
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
    scripts: [App],
    components: [],
    dom: [
      "div",
      {},
      [
        ["Link", { href: "/" }, ["root"]],
        ["Link", { href: "/depoik" }, ["depoik"]],
        [
          "Link",
          { href: "/index.html", title: "index page" },
          [["", {}, ["index.html"]]],
        ],
        [
          "Route",
          { paths: "/index.html", component: 0 },
          ["im a Child", "poipo", "kpokpo"],
        ],
        // ["Route", { paths: "/index.html" }, ["im a Child", "poipo", "kpokpo"]],
      ],
    ],
  },
  "root"
);
