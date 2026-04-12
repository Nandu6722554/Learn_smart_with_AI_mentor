import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Download } from "lucide-react";
import { toggleBookmark, isBookmarked, exportAsText } from "../lib/storage";
import { toast } from "react-hot-toast";

export default function ContentActions({ topic, mode, level, modules }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(topic, mode));
  }, [topic, mode]);

  const handleBookmark = () => {
    const nowSaved = toggleBookmark({ topic, mode, level, modules });
    setSaved(nowSaved);
    toast.success(nowSaved ? "✅ Saved to bookmarks" : "Removed from bookmarks", { duration: 1800 });
  };

  const handleDownload = () => {
    exportAsText(topic, mode, modules);
    toast.success("📥 Downloaded!", { duration: 1800 });
  };

  if (!topic) return null;

  return (
    <div className="content-actions">
      <button
        className={`content-action-btn ${saved ? "saved" : ""}`}
        onClick={handleBookmark}
        title={saved ? "Remove bookmark" : "Save topic"}
      >
        {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        {saved ? "Saved" : "Save"}
      </button>
      <button className="content-action-btn" onClick={handleDownload} title="Download as text">
        <Download size={15} /> Download
      </button>
    </div>
  );
}
