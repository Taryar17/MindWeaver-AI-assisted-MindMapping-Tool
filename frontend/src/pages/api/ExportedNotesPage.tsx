import { useState, useRef } from "react";
import { useLoaderData } from "react-router-dom";
import { type ExportedNote } from "@/api/notes";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Trash2, Eye, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { notesApi } from "@/api/notes";

function ExportedNotesPage() {
  const { notes: initialNotes } = useLoaderData() as { notes: ExportedNote[] };
  const [notes, setNotes] = useState<ExportedNote[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<ExportedNote | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState<string | null>(null);
  const [downloadingNote, setDownloadingNote] = useState<string | null>(null);
  const formatMenuRef = useRef<HTMLDivElement>(null);

  const handleDelete = async (id: string) => {
    try {
      await notesApi.deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
      toast.success("Note deleted successfully");
    } catch (error) {
      toast.error("Failed to delete note");
      console.log(error);
    } finally {
      setShowDeleteDialog(false);
      setNoteToDelete(null);
    }
  };

  // Convert markdown to plain text
  const convertToPlainText = (markdown: string): string => {
    return markdown
      .replace(/^#+\s+/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`[^`]+`/g, "")
      .replace(/^---+$/gm, "")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();
  };

  const handleDownload = async (note: ExportedNote, format: "md" | "txt") => {
    setDownloadingNote(note.id);
    try {
      const fullNote = await notesApi.getNote(note.id);

      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === "txt") {
        content = convertToPlainText(fullNote.content);
        mimeType = "text/plain";
        fileExtension = "txt";
      } else {
        content = fullNote.content;
        mimeType = "text/markdown";
        fileExtension = "md";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowFormatMenu(null);
    } catch (error) {
      console.error("Failed to download note:", error);
      toast.error("Failed to download note");
    } finally {
      setDownloadingNote(null);
    }
  };

  const handlePreview = async (note: ExportedNote) => {
    try {
      const fullNote = await notesApi.getNote(note.id);
      setSelectedNote(fullNote);
      setShowPreview(true);
    } catch (error) {
      console.error("Failed to load note preview:", error);
      toast.error("Failed to load note preview");
    }
  };

  const formatFileSize = (content: string) => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Exported Notes</h1>

      {notes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">No exported notes yet</p>
          <p className="text-sm">
            Generate notes from your mind maps using the "Generate Notes" button
            in the canvas
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-xl shadow-xl overflow-visible">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">From Mind Map</th>
                <th className="text-left p-4">Created</th>
                <th className="text-left p-4">Size</th>
                <th className="text-left p-4">Format</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {notes.map((note) => (
                <tr
                  key={note.id}
                  className="border-b border-border hover:bg-muted/40 transition"
                >
                  <td className="p-4 font-medium text-foreground">
                    {note.title}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {note.mindMap?.title || "Unknown"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDistanceToNow(new Date(note.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatFileSize(note.content)}
                  </td>
                  <td className="p-4 text-muted-foreground uppercase">
                    {note.format}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePreview(note)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Preview"
                        disabled={downloadingNote === note.id}
                      >
                        <Eye className="size-5" />
                      </button>

                      <div className="relative" ref={formatMenuRef}>
                        <button
                          onClick={() =>
                            setShowFormatMenu(
                              showFormatMenu === note.id ? null : note.id,
                            )
                          }
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Download"
                          disabled={downloadingNote === note.id}
                        >
                          {downloadingNote === note.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                          ) : (
                            <Download className="size-5" />
                          )}
                        </button>
                        {showFormatMenu === note.id && (
                          <div className="absolute top-full left-0 mt-1 w-36 bg-card border border-border rounded-md shadow-lg z-50 overflow-visible">
                            <button
                              onClick={() => handleDownload(note, "md")}
                              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                              disabled={downloadingNote === note.id}
                            >
                              Markdown (.md)
                            </button>
                            <button
                              onClick={() => handleDownload(note, "txt")}
                              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                              disabled={downloadingNote === note.id}
                            >
                              Plain Text (.txt)
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setNoteToDelete(note.id);
                          setShowDeleteDialog(true);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Note
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-background text-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => noteToDelete && handleDelete(noteToDelete)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Modal */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="bg-card border-border max-w-4xl max-h-[85vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground text-xl">
              {selectedNote?.title}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="prose prose-base dark:prose-invert max-w-none p-6">
            <ReactMarkdown>{selectedNote?.content || ""}</ReactMarkdown>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-background text-foreground hover:bg-muted">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ExportedNotesPage;
