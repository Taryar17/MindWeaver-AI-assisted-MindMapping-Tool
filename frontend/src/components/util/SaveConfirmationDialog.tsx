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

interface SaveConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function SaveConfirmationDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
}: SaveConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Unsaved Changes
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            You have unsaved changes in your mind map. Do you want to save them
            before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onDiscard}
            className="border-border bg-background text-foreground hover:bg-muted"
          >
            Don't Save
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
