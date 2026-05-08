import { Sparkles } from "lucide-react";

interface AILoadingIndicatorProps {
  type:
    | "generateChildIdeas"
    | "suggestRelatedConcepts"
    | "expandSummary"
    | null;
}

const loadingMessages = {
  generateChildIdeas: "Generating child ideas...",
  suggestRelatedConcepts: "Discovering concepts...",
  expandSummary: "Expanding summary...",
};

export function AILoadingIndicator({ type }: AILoadingIndicatorProps) {
  if (!type) return null;

  return (
    <div className="w-full flex justify-center pt-2 absolute top-2 left-0 right-0 z-50 pointer-events-none">
      <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span className="text-xs font-medium">{loadingMessages[type]}</span>
        <div className="flex gap-1 ml-1">
          <div
            className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
