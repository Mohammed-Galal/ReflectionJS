import render from "./exact/client/index.js";
import { useState } from "./exact/client/hooks.js";

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

function App(props) {
  const [txt, setTxt] = useState(true);

  return {
    "#isComponent": true,
    _id: 1,
    scripts: [txt, () => setTxt(!txt)],
    components: [props.Children],
    dom: ["h1", { onClick: 1 }, [0, " ", [0, {}, []]]],
  };
}

render(() => {
  return {
    "#isComponent": true,
    _id: 0,
    components: [],
    scripts: [App, listOfComponents],
    dom: [
      "main",
      {},
      [
        1,
        [
          "Switch",
          {},
          [
            [
              "Route",
              { "exact:paths": "/about/:d", component: 0 },
              ["im a Child", "poipo", "kpokpo"],
            ],
            ["Route", { "exact:paths": "/", component: 0 }, ["root Component"]],
          ],
        ],

        "deijodij",
      ],
    ],
  };
}, "#root");
