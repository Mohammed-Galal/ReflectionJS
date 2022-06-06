import render from "./exact/client/index.js";
import {
  createContext,
  useBatch,
  useEffect,
  useRef,
  useState,
} from "./exact/client/hooks.js";

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

const context = createContext(function (srv) {
  return {
    id: 1,
  };
});

render(() => {
  const collectionOfRefs = useRef(),
    // [id, setContext] = context(),
    [x, y] = useState(true),
    [a, b] = useState(1);

  // const ev = function () {
  //   y(!x);
  //   b(a + 1);
  // };
  const ev = useBatch(function () {
    y(!x);
    b(a + 1);
    // setContext((srv) => ({ id: 2 }));
  });

  console.log(x, a, collectionOfRefs);

  useEffect(
    function () {
      console.log("useEffect!");
    },
    [x]
  );

  return {
    "#isComponent": true,
    _id: 0,
    components: [App],
    scripts: [listOfComponents, ev, (el) => (collectionOfRefs["main"] = el)],
    dom: [
      "main",
      { onClick: 1, ref: 2 },
      [0, [0, {}, ["im a Child "]], "deijodij"],
    ],
  };
}, "#root");
