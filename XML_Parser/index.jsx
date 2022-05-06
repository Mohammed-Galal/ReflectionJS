export default function () {
  const [x, setX] = useState(1),
    [y, setY] = useServerState("user");
  return (
    <>
      <Switch>
        <Route paths={"/"} />
        hello {y.name}, your Id is{" "}
        {x.map(($) => {
          return <Div>hello {x}</Div>;
        })}
      </Switch>
    </>
  );
}
