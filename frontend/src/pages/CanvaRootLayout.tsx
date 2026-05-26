import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useBlocker, useNavigate } from "react-router-dom";
import Flow from "@/App";
import CanvaNav from "@/components/layouts/CanvaNav";
import useStore from "@/App/store";
import { SaveConfirmationDialog } from "@/components/util/SaveConfirmationDialog";

function CanvaRootLayout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mindMapId = searchParams.get("id");
  const {
    loadMindMap,
    resetToNewMindMap,
    saveMindMap,
    hasUnsavedChanges,
    mindMapId: storeMindMapId,
  } = useStore();
  const initialLoadRef = useRef(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);

  // Sync URL with store when mindMapId changes (after save)
  useEffect(() => {
    if (storeMindMapId && !mindMapId) {
      navigate(`/canva?id=${storeMindMapId}`, { replace: true });
    }
  }, [storeMindMapId, mindMapId, navigate]);

  // Use blocker to intercept navigation attempts
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return (
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );
  });

  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    if (mindMapId) {
      loadMindMap(mindMapId);
    } else {
      resetToNewMindMap();
    }
  }, [mindMapId, loadMindMap, resetToNewMindMap]);

  // Handle blocker when navigation is attempted
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowSaveDialog(true);
    }
  }, [blocker]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSaveAndLeave = async () => {
    try {
      await saveMindMap();
      if (blocker.state === "blocked") {
        blocker.proceed();
      } else if (pendingNavigation) {
        pendingNavigation();
      }
    } catch (error) {
      console.error("Failed to save before leaving:", error);
    } finally {
      setShowSaveDialog(false);
      setPendingNavigation(null);
    }
  };

  const handleDiscardAndLeave = () => {
    if (blocker.state === "blocked") {
      blocker.proceed();
    } else if (pendingNavigation) {
      pendingNavigation();
    }
    setShowSaveDialog(false);
    setPendingNavigation(null);
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-background">
        <CanvaNav />
        <div className="flex-1">
          <Flow />
        </div>
      </div>
      <SaveConfirmationDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscardAndLeave}
      />
    </ReactFlowProvider>
  );
}

export default CanvaRootLayout;
