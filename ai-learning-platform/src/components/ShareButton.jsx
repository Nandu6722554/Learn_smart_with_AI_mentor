import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export default function ShareButton({ topic, summary }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen]     = useState(false);

  const text = `📚 Just learned about "${topic}" on MentorAI!\n\n${summary || ""}\n\nLearn anything at mentorai.app`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 2000);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: `Learned: ${topic}`, text });
    } else {
      copyToClipboard();
    }
  };

  if (!topic) return null;

  return (
    <div className="share-wrap">
      <button className="share-btn" onClick={() => setOpen(o => !o)}>
        <Share2 size={14} /> Share
      </button>
      {open && (
        <div className="share-dropdown">
          <button onClick={shareNative}>
            <Share2 size={13} /> Share
          </button>
          <button onClick={copyToClipboard}>
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy summary</>}
          </button>
        </div>
      )}
    </div>
  );
}
