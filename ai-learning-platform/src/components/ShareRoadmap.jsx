import { useState } from "react";
import { Share2, Copy, Check, Link } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ShareRoadmap({ data }) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const shareText = [
    `🗺️ My ${data.total_weeks}-Week Learning Roadmap`,
    `Goal: ${data.goal}`,
    ``,
    data.weeks?.slice(0, 3).map(w => `Week ${w.week}: ${w.theme}`).join("\n"),
    `...and ${Math.max(0, (data.total_weeks || 0) - 3)} more weeks`,
    ``,
    `Generated with MentorAI 🎓`,
  ].join("\n");

  const copyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success("📋 Roadmap copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: `My ${data.goal} Roadmap`, text: shareText });
    } else {
      copyLink();
    }
  };

  return (
    <div className="share-roadmap">
      <button className="share-roadmap-btn" onClick={shareNative}>
        <Share2 size={14} /> Share Roadmap
      </button>
      <button className="share-roadmap-btn outline" onClick={copyLink}>
        {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
      </button>
    </div>
  );
}
