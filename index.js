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

function App() {
  const [txt, setTxt] = useState(true);

  return {
    "#isComponent": true,
    _id: 1,
    scripts: [txt, () => setTxt(!txt)],
    components: [],
    dom: ["h1", { onClick: 1 }, [0]],
  };
}

render(
  {
    "#isComponent": true,
    _id: 0,
    scripts: [],
    components: [App],
    dom: ["", {}, [[0, {}, []]]],
  },
  () => document.getElementById("root")
);
