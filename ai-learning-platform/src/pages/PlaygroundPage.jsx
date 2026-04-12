import PlaygroundTab from "../components/PlaygroundTab";
import Loader from "../components/Loader";

export default function PlaygroundPage({ pgData, loading, onPractice, topic }) {
  if (loading) return <Loader text="Preparing practice tasks..." />;
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <h2>🛠️ Practice Playground</h2>
        <p>Apply what you've learned with hands-on tasks</p>
      </div>
      <PlaygroundTab data={pgData} topic={topic} onPractice={onPractice} />
    </div>
  );
}
