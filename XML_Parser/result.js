export default function () {
  const [x, setX] = useState(1),
    [y, setY] = useServerState("user");
  return {
    "#isComponent": true,
    key: 0,
    scripts: [
      "/",
      y.name,
      " ",
      x.map(($) => {
        return {
          "#isComponent": true,
          key: 1,
          scripts: [x],
          components: [Div],
          dom: [0, {}, ["hello ", 0]],
        };
      }),
    ],
    components: [],
    dom: [
      "",
      {},
      [
        [
          "Switch",
          {},
          [["Route", { paths: 0 }, []], "hello ", 1, ", your Id is", 2, 3],
        ],
      ],
    ],
  };
}
