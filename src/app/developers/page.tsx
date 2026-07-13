import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";

interface StackItem {
  name: string;
  version: string;
  role: string;
}

const CORE_STACK: StackItem[] = [
  { name: "Next.js", version: "16.2.10", role: "App Router framework, dev server (Turbopack), routing & bundling" },
  { name: "React", version: "19.2.4", role: "UI library" },
  { name: "TypeScript", version: "^5", role: "Static typing across the codebase" },
  { name: "Tailwind CSS", version: "^4", role: "Utility-first styling, via @tailwindcss/postcss" },
];

const UI_STACK: StackItem[] = [
  { name: "lucide-react", version: "^1.24.0", role: "Icon set used throughout the UI" },
  { name: "framer-motion", version: "^12.42.2", role: "Transitions and micro-interactions" },
  { name: "clsx", version: "^2.1.1", role: "Conditional className composition" },
  { name: "tailwind-merge", version: "^3.6.0", role: "Merging conflicting Tailwind classes safely" },
  { name: "date-fns", version: "^4.4.0", role: "Date formatting and comparisons (calendar, streaks)" },
];

const EDITOR_STACK: StackItem[] = [
  { name: "@tiptap/react", version: "^3.27.3", role: "React bindings for the Tiptap editor" },
  { name: "@tiptap/starter-kit", version: "^3.27.3", role: "Core nodes/marks: paragraph, headings, bold, italic, lists, blockquote, etc." },
  { name: "@tiptap/extension-code-block-lowlight", version: "^3.27.3", role: "Fenced code blocks with a language picker" },
  { name: "lowlight", version: "^3.3.0", role: "Syntax highlighting engine (highlight.js under the hood) for code blocks" },
  { name: "@tiptap/extension-table(-row/-cell/-header)", version: "^3.27.3", role: "Resizable tables" },
  { name: "@tiptap/extension-task-list / -task-item", version: "^3.27.3", role: "Nested checklists" },
  { name: "@tiptap/extension-image", version: "^3.27.3", role: "Inline images — drag/drop, paste, and resize (custom width attribute)" },
  { name: "@tiptap/extension-youtube", version: "^3.27.3", role: "YouTube video embeds" },
  { name: "@tiptap/extension-link", version: "^3.27.3", role: "Hyperlinks with autolink detection" },
  { name: "@tiptap/extension-text-align / -color / -text-style", version: "^3.27.3", role: "Alignment, custom font color/family/size" },
  { name: "@tiptap/extension-highlight / -underline / -sub/superscript", version: "^3.27.3", role: "Additional inline formatting marks" },
  { name: "@tiptap/extension-placeholder", version: "^3.27.3", role: "Empty-editor placeholder text" },
];

const SCAFFOLDED_STACK: StackItem[] = [
  { name: "prisma / @prisma/client", version: "^7.8.0", role: "ORM + schema for a future PostgreSQL backend (see prisma/schema.prisma) — not yet wired into the app" },
  { name: "next-auth", version: "^4.24.14", role: "Planned authentication for account-based, cross-device sync" },
  { name: "nodemailer", version: "^9.0.3", role: "Planned SMTP email for reminders" },
];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>
        {title}
      </h2>
      {description && (
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      )}
      {children}
    </section>
  );
}

function StackTable({ items }: { items: StackItem[] }) {
  return (
    <div className="card !p-0 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {items.map((item, i) => (
            <tr key={item.name} className={i !== items.length - 1 ? "border-b" : ""} style={{ borderColor: "var(--border-light)" }}>
              <td className="py-3 px-4 font-semibold whitespace-nowrap align-top" style={{ color: "var(--text)" }}>
                {item.name}
              </td>
              <td className="py-3 px-4 whitespace-nowrap align-top" style={{ color: "var(--text-tertiary)" }}>
                {item.version}
              </td>
              <td className="py-3 px-4 align-top" style={{ color: "var(--text-secondary)" }}>
                {item.role}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <Link href="/" className="btn btn-secondary text-sm mb-8">
          <ArrowLeft size={16} />
          Back to Journal
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Terminal size={28} style={{ color: "var(--accent)" }} />
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
            For Developers
          </h1>
        </div>
        <p className="mb-10" style={{ color: "var(--text-secondary)" }}>
          A detailed look at what this app is built with, how it stores data, and how the project is organized.
        </p>

        <Section title="Core Stack">
          <StackTable items={CORE_STACK} />
        </Section>

        <Section title="UI & Utilities">
          <StackTable items={UI_STACK} />
        </Section>

        <Section
          title="Editor: Tiptap"
          description="The rich text editor (src/components/Editor/RichTextEditor.tsx) is built on Tiptap, a headless, extension-based wrapper around ProseMirror."
        >
          <StackTable items={EDITOR_STACK} />
        </Section>

        <Section
          title="Data & Storage"
          description="Inkwell is entirely client-side right now — there is no server or database in the request path."
        >
          <div className="card space-y-4">
            <div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>localStorage</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Entries (<code>life-journal-entries</code>) and the optional 4-digit PIN (<code>life-journal-pin</code>) are
                read/written via <code>src/lib/storage.ts</code>.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>IndexedDB</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Uploaded/pasted images are stored as blobs in IndexedDB (<code>src/lib/indexedDB.ts</code>) and referenced
                from entry content by id, then rehydrated to object URLs on load.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Scaffolded for later</h3>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                <code>prisma/schema.prisma</code>, next-auth, and nodemailer are already in <code>package.json</code> for a
                planned account-based sync + email reminders feature, but nothing in <code>src/</code> calls them yet.
              </p>
              <StackTable items={SCAFFOLDED_STACK} />
            </div>
          </div>
        </Section>

        <Section title="Project Structure">
          <div className="card">
            <pre className="text-xs leading-relaxed overflow-x-auto" style={{ color: "var(--text-secondary)" }}>
{`src/
  app/
    page.tsx           Root client page — sidebar + dashboard/editor shell
    developers/page.tsx  This page
    layout.tsx          Root layout, fonts, theme bootstrap script
    globals.css          Design tokens + Tailwind layer
  components/
    Editor/               RichTextEditor, Toolbar, CodeBlockComponent (Tiptap)
    Dashboard.tsx         Calendar, streak, mood analytics, quote widget
    Sidebar.tsx           Entry list, search/filters, per-entry menu
    EntryEditor.tsx       Single entry chrome (mood, pin, favorite, export…)
    CalendarView.tsx / YearlyOverview.tsx
    PinLock.tsx / SetPinModal.tsx   App lock
    ThemeSelector.tsx     Light/dark + accent theme switcher
  lib/
    storage.ts            localStorage entries/PIN + streak calculation
    indexedDB.ts           Image blob storage
    export.ts               Per-entry HTML/XML export
    types.ts                 Entry type, moods, weather, writing prompts`}
            </pre>
          </div>
        </Section>

        <Section title="Scripts">
          <div className="card">
            <ul className="text-sm space-y-2 font-mono" style={{ color: "var(--text-secondary)" }}>
              <li><span style={{ color: "var(--accent)" }}>dev</span> — next dev (Turbopack)</li>
              <li><span style={{ color: "var(--accent)" }}>build</span> — next build</li>
              <li><span style={{ color: "var(--accent)" }}>start</span> — next start</li>
              <li><span style={{ color: "var(--accent)" }}>lint</span> — eslint</li>
            </ul>
            <p className="text-xs mt-4" style={{ color: "var(--text-tertiary)" }}>
              The repo ships a <code>bun.lock</code>, but <code>npm install --legacy-peer-deps</code> also works — it&apos;s
              needed because <code>next-auth</code> peer-depends on an older <code>nodemailer</code> major than the one
              installed.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
