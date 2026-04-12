import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

function detectLang(code) {
  if (!code) return "python";
  if (/def |import |print\(|:\n/.test(code)) return "python";
  if (/const |let |var |=>|function |console\./.test(code)) return "javascript";
  if (/#include|int main|cout/.test(code)) return "cpp";
  return "python";
}

export default function CodeBlock({ code, label = "Example Code" }) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const lang = detectLang(code);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="codeblock-wrap">
      <div className="codeblock-header">
        <span className="codeblock-label">
          <span className="codeblock-dot" />
          <span className="codeblock-dot" />
          <span className="codeblock-dot" />
          <span className="codeblock-lang">{label} · {lang}</span>
        </span>
        <button className="codeblock-copy" onClick={copy}>
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: "0 0 10px 10px",
          fontSize: "0.85rem",
          lineHeight: "1.6",
          padding: "1rem 1.25rem",
          background: "#0d1117",
        }}
        showLineNumbers
        lineNumberStyle={{ color: "#3d4451", fontSize: "0.75rem", minWidth: "2rem" }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
