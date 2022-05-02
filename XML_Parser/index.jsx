export default function () {
  const [x, setX] = useState(1),
    [y, setY] = useServerState("user");
  return (
    <>
      <img />
      hello {y.name}, your Id is {x}
    </>
  );
}
