"use client";

import {
  PenLine,
  CalendarDays,
  Flame,
  Activity,
  Star,
  Pin,
  Tag,
  Search,
  MapPin,
  Cloud,
  Sparkles,
  FileDown,
  Lock,
  Palette,
  Image as ImageIcon,
  Code2,
  Table as TableIcon,
  CheckSquare,
  Video as YoutubeIcon,
  Quote as QuoteIcon,
  ShieldCheck,
} from "lucide-react";

const FEATURES: { icon: React.ElementType; title: string; description: string }[] = [
  {
    icon: PenLine,
    title: "Rich Text Editor",
    description:
      "A Notion-style editor with headings, lists, checklists, tables, block quotes, alignment, custom fonts, and colors.",
  },
  {
    icon: Code2,
    title: "Code Blocks",
    description: "Syntax-highlighted code blocks with a language picker and one-click copy button.",
  },
  {
    icon: ImageIcon,
    title: "Drag, Drop & Paste Images",
    description: "Drop images straight into an entry, paste from your clipboard, and resize them inline.",
  },
  {
    icon: TableIcon,
    title: "Tables",
    description: "Insert tables and manage rows and columns directly inside your entries.",
  },
  {
    icon: CheckSquare,
    title: "Task Lists",
    description: "Nested checklists for tracking to-dos alongside your journaling.",
  },
  {
    icon: YoutubeIcon,
    title: "Media Embeds",
    description: "Embed YouTube videos and links right inside an entry.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Yearly Overview",
    description: "Browse entries by date on a calendar, or zoom out to a full year at a glance.",
  },
  {
    icon: Flame,
    title: "Writing Streaks",
    description: "Tracks your current daily writing streak to help keep the habit going.",
  },
  {
    icon: Activity,
    title: "Mood Analytics",
    description: "See a breakdown of the moods behind your entries over time.",
  },
  {
    icon: QuoteIcon,
    title: "Daily Inspiration",
    description: "A fresh quote and writing prompts to help you get past writer's block.",
  },
  {
    icon: Star,
    title: "Favorites",
    description: "Mark your most meaningful entries as favorites for quick access.",
  },
  {
    icon: Pin,
    title: "Pin Notes",
    description: "Pin important entries so they always stay at the top of the list.",
  },
  {
    icon: Tag,
    title: "Tags & Color Flags",
    description: "Organize entries with tags and color flags for fast visual sorting.",
  },
  {
    icon: Search,
    title: "Search & Filters",
    description: "Search entries by keyword, or filter by mood and favorites.",
  },
  {
    icon: MapPin,
    title: "Location & Weather",
    description: "Attach a location and the day's weather to any entry.",
  },
  {
    icon: FileDown,
    title: "Export Entries",
    description: "Export a single entry or your entire journal as HTML or XML, anytime.",
  },
  {
    icon: Lock,
    title: "PIN Lock",
    description: "Protect your journal with a 4-digit PIN so it's for your eyes only.",
  },
  {
    icon: Palette,
    title: "Themes",
    description: "Switch between light and dark themes and accent colors to match your mood.",
  },
  {
    icon: ShieldCheck,
    title: "100% Private",
    description: "Everything is stored locally on your device — no account, no server, no tracking.",
  },
  {
    icon: Sparkles,
    title: "Quick Entry Menu",
    description: "Pin or export any entry straight from the sidebar with the ⋮ menu.",
  },
];

export default function FeaturesOverview() {
  return (
    <div className="pt-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
          Everything Your Journal Can Do
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          A quick tour of the features built into Inkwell.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="card">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}
            >
              <Icon size={20} />
            </div>
            <h3 className="font-bold mb-1" style={{ color: "var(--text)" }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
