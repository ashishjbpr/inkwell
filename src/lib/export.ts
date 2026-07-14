import { Entry, MOODS } from "./types";

function downloadBlob(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportEntryHTML(entry: Entry) {
  const moodInfo = MOODS.find((m) => m.value === entry.mood);
  const exportContent = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>${entry.title || "Journal Entry"}</title>
      <style>
        @page { margin: 20mm; }
        body { font-family: 'Inter', -apple-system, sans-serif; color: #1e1b2e; line-height: 1.8; max-width: 700px; margin: 0 auto; padding: 40px 20px; }
        h1 { font-size: 28px; margin-bottom: 8px; color: #1e1b2e; }
        .meta { color: #9d96b8; font-size: 14px; margin-bottom: 32px; }
        .mood { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-bottom: 24px; }
        .tags { margin-bottom: 24px; }
        .tag { display: inline-block; padding: 2px 8px; border-radius: 6px; background: #eef0ff; color: #4338ca; font-size: 12px; margin-right: 4px; }
        .content { margin-top: 24px; }
        .content p { margin-bottom: 16px; }
        .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2dff0; font-size: 12px; color: #9d96b8; text-align: center; }
      </style>
    </head>
    <body>
      <h1>${entry.title || "Untitled"}</h1>
      <div class="meta">${new Date(entry.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      ${entry.mood ? `<div class="mood">${moodInfo ? moodInfo.label : entry.mood}</div>` : ""}
      ${entry.tags.length > 0 ? `<div class="tags">${entry.tags.map((t) => `<span class="tag">#${t}</span>`).join(" ")}</div>` : ""}
      <div class="content">${entry.content}</div>
      <div class="footer">From my Inkwell — a private reflection</div>
    </body>
    </html>
  `;

  downloadBlob(exportContent, "text/html", `journal-entry-${entry.id.slice(0, 8)}.html`);
}

export function exportEntryXML(entry: Entry) {
  const exportContent = `<?xml version="1.0" encoding="UTF-8"?>
<entry>
  <id>${entry.id}</id>
  <title><![CDATA[${entry.title}]]></title>
  <createdAt>${entry.createdAt}</createdAt>
  <updatedAt>${entry.updatedAt}</updatedAt>
  <mood>${entry.mood || ""}</mood>
  <location><![CDATA[${entry.location || ""}]]></location>
  <weather><![CDATA[${entry.weather || ""}]]></weather>
  <tags>
    ${entry.tags.map(t => `<tag><![CDATA[${t}]]></tag>`).join("\\n    ")}
  </tags>
  <content><![CDATA[${entry.content}]]></content>
</entry>`;

  downloadBlob(exportContent, "application/xml", `journal-entry-${entry.id.slice(0, 8)}.xml`);
}
