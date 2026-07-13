export type Mood = "happy" | "sad" | "angry" | "anxious" | "calm" | "excited" | "tired" | "thoughtful" | "grateful" | "hopeful";

export interface Entry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  colorFlag?: string;
  location?: string;
  weather?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export const WEATHER_OPTIONS = [
  { value: "sunny", label: "Sunny", icon: "Sun" },
  { value: "cloudy", label: "Cloudy", icon: "Cloud" },
  { value: "rainy", label: "Rainy", icon: "CloudRain" },
  { value: "stormy", label: "Stormy", icon: "CloudLightning" },
  { value: "snowy", label: "Snowy", icon: "CloudSnow" },
  { value: "windy", label: "Windy", icon: "Wind" },
];

export const MOODS: { value: Mood; label: string; icon: string; color: string }[] = [
  { value: "happy", label: "Happy", icon: "Smile", color: "#FCD34D" },
  { value: "sad", label: "Sad", icon: "Frown", color: "#93C5FD" },
  { value: "angry", label: "Angry", icon: "Angry", color: "#FCA5A5" },
  { value: "anxious", label: "Anxious", icon: "AlertCircle", color: "#C4B5FD" },
  { value: "calm", label: "Calm", icon: "Cloud", color: "#86EFAC" },
  { value: "excited", label: "Excited", icon: "Star", color: "#FDBA74" },
  { value: "tired", label: "Tired", icon: "Coffee", color: "#D4D4D8" },
  { value: "thoughtful", label: "Thoughtful", icon: "Lightbulb", color: "#A7F3D0" },
  { value: "grateful", label: "Grateful", icon: "Heart", color: "#FDE68A" },
  { value: "hopeful", label: "Hopeful", icon: "Sunrise", color: "#C7D2FE" },
];

export const WRITING_PROMPTS: string[] = [
  "What made you smile today?",
  "Describe a challenge you overcame this week.",
  "What are you grateful for right now?",
  "If your life were a book, what chapter are you in?",
  "What's one thing you'd tell your younger self?",
  "Describe a moment that took your breath away.",
  "What does your ideal day look like?",
  "What's a lesson life has been teaching you lately?",
  "Who has shaped who you are today?",
  "What are you afraid to admit to yourself?",
  "What made today different from yesterday?",
  "Write about a place that feels like home.",
  "What dream keeps coming back to you?",
  "What's the bravest thing you've done this month?",
  "Describe the view from your window right now.",
  "What are you learning about yourself these days?",
  "What would you do if you knew you could not fail?",
  "What memory makes you smile every time?",
  "What's a small kindness you witnessed recently?",
  "What does freedom mean to you?",
  "Write a letter to your future self.",
  "What's something you've been avoiding?",
  "Describe your perfect morning routine.",
  "What's a belief you're ready to let go of?",
  "What made you feel alive today?",
  "What would you do with more time?",
  "Who do you miss right now?",
  "What's the best advice you've ever received?",
  "Describe a mistake that taught you something.",
  "What does self-care look like for you?",
];
