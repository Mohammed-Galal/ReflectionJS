import render from "./exact/client/index.js";
import { useState } from "./exact/client/hooks.js";

const listOfComponents = [
  {
    "#isComponent": true,
    key: "One",
    _id: 3,
    scripts: [],
    components: [],
    dom: ["Link", { href: "/index" }, ["One"]],
  },
  {
    "#isComponent": true,
    key: "Two",
    _id: 3,
    scripts: [],
    components: [],
    dom: ["Link", { href: "/about" }, ["Two"]],
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

function App(props) {
  const [txt, setTxt] = useState(true);

  console.log(props);

  return {
    "#isComponent": true,
    _id: 1,
    scripts: [txt, () => setTxt(!txt)],
    components: [props.Children],
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
      "",
      {},
      [
        1,
        [
          "Route",
          { "exact:paths": "/:index", component: 0 },
          // { paths: "/index.html" },
          ["im a Child", "poipo", "kpokpo"],
        ],
      ],
    ],
  },
  "root"
);
