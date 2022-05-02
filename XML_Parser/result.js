export default function () {
  const [x, setX] = useState(1),
    [y, setY] = useServerState("user");
  return {
    "#isComponent": true,
    key: 0,
    scripts: [y.name, x],
    components: [],
    dom: ["", null, [["img", null, []], "hello ", 0, ", your Id is ", 1]],
  };
}
