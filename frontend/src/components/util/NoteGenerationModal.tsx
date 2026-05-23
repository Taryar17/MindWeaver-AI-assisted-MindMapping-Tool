import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Download, X } from "lucide-react";
import { notesApi } from "@/api/notes";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface NoteGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mindMapId: string;
  mindMapTitle: string;
  onNoteGenerated?: () => void;
}

export function NoteGenerationModal({
  isOpen,
  onClose,
  mindMapId,
  mindMapTitle,
  onNoteGenerated,
}: NoteGenerationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [step, setStep] = useState<"generate" | "preview">("generate");
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const formatMenuRef = useRef<HTMLDivElement>(null);

  // Close format menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        formatMenuRef.current &&
        !formatMenuRef.current.contains(event.target as Node)
      ) {
        setShowFormatMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await notesApi.generateNote({ mindMapId });
      setGeneratedNote(response.content);
      setNoteTitle(`${mindMapTitle} - Notes`);
      setStep("preview");
      toast.success("Note generated successfully!");
    } catch (error) {
      toast.error("Failed to generate note");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedNote) return;

    try {
      await notesApi.saveNote({
        mindMapId,
        title: noteTitle,
        content: generatedNote,
        format: "markdown",
      });
      toast.success("Note saved to Exported Notes!");
      onNoteGenerated?.();
      onClose();
    } catch (error) {
      toast.error("Failed to save note");
      console.error(error);
    }
  };

  // Convert markdown to plain text (remove markdown formatting)
  const convertToPlainText = (markdown: string): string => {
    return (
      markdown
        // Remove headings
        .replace(/^#+\s+/gm, "")
        // Remove bold/italic
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/_([^_]+)_/g, "$1")
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Remove code blocks
        .replace(/`[^`]+`/g, "")
        // Remove horizontal rules
        .replace(/^---+$/gm, "")
        // Clean up extra newlines
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim()
    );
  };

  const handleDownload = (format: "md" | "txt") => {
    if (!generatedNote) return;

    let content: string;
    let mimeType: string;
    let fileExtension: string;

    if (format === "txt") {
      content = convertToPlainText(generatedNote);
      mimeType = "text/plain";
      fileExtension = "txt";
    } else {
      content = generatedNote;
      mimeType = "text/markdown";
      fileExtension = "md";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${noteTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowFormatMenu(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {step === "generate"
                ? "Generate Notes from Mind Map"
                : "Preview Note"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {step === "generate" ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Generate a comprehensive, well-structured note based on your
                mind map "{mindMapTitle}". The AI will analyze your mind map
                structure and create detailed notes with proper hierarchy.
              </p>

              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  What will be generated:
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Introduction explaining the main topic</li>
                  <li>Hierarchical structure following your mind map</li>
                  <li>Detailed paragraphs for each node</li>
                  <li>Connections between different branches</li>
                  <li>Conclusion summarizing key points</li>
                  <li>
                    <strong>Reflective Insights</strong> - Analysis of your
                    thinking patterns, cognitive approaches, and suggestions for
                    deeper understanding
                  </li>
                  <li>Formatted in Markdown with proper headings</li>
                </ul>
              </div>
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  The "Reflective Insights" section analyzes how you organized
                  information, identifies potential knowledge gaps, and suggests
                  mental frameworks to enhance your understanding of the topic.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground block mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter note title"
                  />
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg border border-border p-4 overflow-auto max-h-[50vh]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{generatedNote || ""}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>

          {step === "generate" ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Note
                </>
              )}
            </button>
          ) : (
            <div className="flex gap-2">
              {/* Download button with format dropdown */}
              <div className="relative" ref={formatMenuRef}>
                <button
                  onClick={() => setShowFormatMenu(!showFormatMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                {showFormatMenu && (
                  <div className="absolute bottom-full right-0 mb-1 w-32 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => handleDownload("md")}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Markdown (.md)
                    </button>
                    <button
                      onClick={() => handleDownload("txt")}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Plain Text (.txt)
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm"
              >
                <FileText className="h-4 w-4" />
                Save to Exported Notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
