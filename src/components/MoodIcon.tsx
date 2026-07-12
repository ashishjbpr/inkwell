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
  type LucideIcon,
} from "lucide-react";
import { Mood } from "@/lib/types";

const iconMap: Record<Mood, LucideIcon> = {
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

interface MoodIconProps {
  mood: Mood;
  className?: string;
  size?: number;
}

export default function MoodIcon({ mood, className, size = 20 }: MoodIconProps) {
  const Icon = iconMap[mood];
  if (!Icon) return null;
  return <Icon className={className} size={size} />;
}