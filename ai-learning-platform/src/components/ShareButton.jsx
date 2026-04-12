import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";

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
      setOpen(false);
    } else {
      copyToClipboard();
    }
  };

  if (!topic) return null;

  return (
    <div className="sb-wrap">
      <button className="sb-trigger" onClick={() => setOpen(o => !o)}>
        <Share2 size={14} />
        <span>Share</span>
      </button>

      {open && (
        <div className="sb-dropdown">
          <div className="sb-dropdown-header">
            <span>Share this topic</span>
            <button className="sb-close" onClick={() => setOpen(false)}><X size={13} /></button>
          </div>
          <button className="sb-option" onClick={shareNative}>
            <Share2 size={14} /> Share via...
          </button>
          <button className="sb-option" onClick={copyToClipboard}>
            {copied ? <><Check size={14} style={{ color: "#10B981" }} /> Copied!</> : <><Copy size={14} /> Copy summary</>}
          </button>
        </div>
      )}
    </div>
  );
}
