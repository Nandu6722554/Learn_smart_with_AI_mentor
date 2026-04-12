export default function PlaygroundTab({ data }) {
  if (!data) return <p className="placeholder">Generate a topic first to explore the playground.</p>;

  return (
    <div className="playground-tab">
      <div className="pg-header">
        <span className="pg-type">{data.type}</span>
        <h3>{data.title}</h3>
      </div>
      <p>{data.description}</p>

      <div className="pg-io">
        <div className="pg-box">
          <label>Input</label>
          <pre>{data.example_input}</pre>
        </div>
        <div className="pg-box">
          <label>Output</label>
          <pre>{data.example_output}</pre>
        </div>
      </div>

      <div className="pg-steps">
        <h4>Steps to Try</h4>
        <ol>
          {data.steps_to_try?.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </div>

      <div className="pg-learning">
        <strong>Expected Learning:</strong> {data.expected_learning}
      </div>
    </div>
  );
}
