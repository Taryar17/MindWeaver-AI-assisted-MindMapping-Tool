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
import { useNavigate } from "react-router-dom";

interface CreateCanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCanvasDialog({
  open,
  onOpenChange,
}: CreateCanvasDialogProps) {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate("/canva");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Create New Canvas
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Start a fresh mind map. Any unsaved changes in your current
            workspace will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border bg-background text-foreground hover:bg-muted">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Create Canvas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
