import {
  Smile,
  Frown,
  Angry,
  AlertCircle,
  Cloud,
  Star,
  Coffee,
  Lightbulb,
  Heart,
  Sunrise,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Mood } from "@/lib/types";

const iconMap: Record<string, LucideIcon> = {
  happy: Smile,
  sad: Frown,
  angry: Angry,
  anxious: AlertCircle,
  calm: Cloud,
  excited: Star,
  tired: Coffee,
  thoughtful: Lightbulb,
  grateful: Heart,
  hopeful: Sunrise,
};

// Generic icon for custom moods that aren't one of the built-in presets.
const FALLBACK_ICON = Sparkles;

interface MoodIconProps {
  mood: Mood;
  className?: string;
  size?: number;
}

export default function MoodIcon({ mood, className, size = 20 }: MoodIconProps) {
  const Icon = iconMap[mood] ?? FALLBACK_ICON;
  return <Icon className={className} size={size} />;
}