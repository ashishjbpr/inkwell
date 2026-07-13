"use client";

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { useState } from "react";
import { Code2, Copy, Check } from "lucide-react";

const LANGUAGES = [
  { label: "Plain Text", value: "plaintext" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "JSX", value: "jsx" },
  { label: "TSX", value: "tsx" },
  { label: "HTML", value: "xml" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "PHP", value: "php" },
  { label: "Ruby", value: "ruby" },
  { label: "SQL", value: "sql" },
  { label: "Bash", value: "bash" },
  { label: "YAML", value: "yaml" },
  { label: "Markdown", value: "markdown" },
];

export default function CodeBlockComponent({ node, updateAttributes, extension }: ReactNodeViewProps) {
  const [copied, setCopied] = useState(false);
  const language = node.attrs.language || "plaintext";

  const languages: string[] =
    extension.options.lowlight?.listLanguages?.() ?? LANGUAGES.map((l) => l.value);

  const options = LANGUAGES.filter((l) => l.value === "plaintext" || languages.includes(l.value));

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(node.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied; ignore.
    }
  }

  return (
    <NodeViewWrapper className="code-block-node my-4 rounded-xl overflow-hidden border" style={{ borderColor: "rgba(241, 230, 207, 0.15)" }}>
      <div
        className="flex items-center justify-between px-3 py-2 border-b select-none"
        style={{ backgroundColor: "rgba(45, 34, 20, 0.97)", borderColor: "rgba(241, 230, 207, 0.15)" }}
        contentEditable={false}
      >
        <div className="flex items-center gap-2">
          <Code2 size={14} style={{ color: "#c9b48c" }} />
          <select
            value={language}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="bg-transparent text-xs font-medium outline-none cursor-pointer"
            style={{ color: "#f1e6cf" }}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ color: "#000" }}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors hover:bg-white/10"
          style={{ color: "#c9b48c" }}
          title="Copy code"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="!m-0 !rounded-none">
        <NodeViewContent className={`language-${language}`} />
      </pre>
    </NodeViewWrapper>
  );
}
