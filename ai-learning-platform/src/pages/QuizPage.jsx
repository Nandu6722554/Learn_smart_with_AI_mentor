import QuizTab from "../components/QuizTab";
import Loader from "../components/Loader";

export default function QuizPage({ quizData, loading, onQuizComplete, topic }) {
  if (loading) return <Loader text="Generating quiz questions..." />;
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <h2>📝 Quiz</h2>
        <p>Test your understanding with AI-generated questions</p>
      </div>
      <QuizTab data={quizData} onQuizComplete={onQuizComplete} topic={topic} />
    </div>
  );
}
