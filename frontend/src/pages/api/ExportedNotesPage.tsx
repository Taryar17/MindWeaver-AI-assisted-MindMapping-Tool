import { useEffect, useState } from "react";
import { notesApi, type ExportedNote } from "@/api/notes";
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

function ExportedNotesPage() {
  const [notes, setNotes] = useState<ExportedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<ExportedNote | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await notesApi.getUserNotes();
      setNotes(data);
    } catch (error) {
      console.error("Failed to load notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

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

  const handleDownload = (note: ExportedNote) => {
    const blob = new Blob([note.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (content: string) => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden">
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
                        onClick={() => {
                          setSelectedNote(note);
                          setShowPreview(true);
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Preview"
                      >
                        <Eye className="size-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(note)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Download"
                      >
                        <Download className="size-5" />
                      </button>
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
        <AlertDialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {selectedNote?.title}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none p-4">
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
