import render from "./exact/index.js";
import { useState } from "./exact/client/hooks.js";

function App({ Children }) {
  const [txt, setTxt] = useState(true);

  // console.log(Children);

  return {
    "#isComponent": true,
    _id: 1,
    scripts: [txt, () => setTxt(!txt)],
    components: [Children],
    dom: ["h1", { onClick: 1 }, [0, [0, {}, []]]],
  };
}

render(
  {
    "#isComponent": true,
    _id: 0,
    scripts: ["dwajoi", ["/"]],
    components: [App],
    dom: [
      "div",
      {},
      [
        [
          0,
          {},
          [
            ["", {}, ["kjfoej"]],
            ["p", {}, ["paragraph"]],
          ],
        ],
      ],
      // [["", {}, [" Hello from Home Route ", ["p", {}, ["pokpe"]]]]],
      // [[0, {}, [" Hello from Home Route ", ["p", {}, ["pokpe"]]]]],
      // [[0, {}, [["", {}, [" Hello from Home Route ", "pokpe"]]]]],
    ],
  },
  document.getElementById("root")
);

// const listOfComponents = [
//   {
//     "#isComponent": true,
//     _id: 3,
//     scripts: [],
//     components: [],
//     dom: ["p", { key: "lst" }, ["test list of components 1"]],
//   },
//   {
//     "#isComponent": true,
//     _id: 4,
//     scripts: [],
//     components: [],
//     dom: ["p", { key: "2nd" }, ["test list of components 2"]],
//   },
// ];
