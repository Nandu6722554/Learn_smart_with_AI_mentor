import LearnTab from "../components/LearnTab";
import Loader from "../components/Loader";
import ContentActions from "../components/ContentActions";

export default function LearnPage({ learnData, quizData, pgData, loading, topic, onTopicSelect, onSectionChange, onPractice, weakAreas, allModules, mode, level }) {
  if (loading) return <Loader text="Building your learning module..." />;

  if (!learnData) return (
    <div className="page-empty">
      <div className="page-empty-icon">📚</div>
      <h3>Nothing here yet</h3>
      <p>Enter a topic in the header and click Generate to start learning.</p>
    </div>
  );

  return (
    <div className="learn-page-layout">
      <div className="learn-page-top-actions">
        <ContentActions topic={topic} mode={mode} level={level} modules={allModules} />
      </div>
      <LearnTab
        data={learnData}
        playgroundData={pgData}
        quizData={quizData}
        onTopicSelect={onTopicSelect}
        onSectionChange={onSectionChange}
        onPractice={onPractice}
        topic={topic}
        weakAreas={weakAreas}
      />
    </div>
  );
}
