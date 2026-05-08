// pages/CanvaRootLayout.tsx
import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Flow from "@/App";
import CanvaNav from "@/components/layouts/CanvaNav";
import useStore from "@/App/store";

function CanvaRootLayout() {
  const [searchParams] = useSearchParams();
  const mindMapId = searchParams.get("id");
  const { loadMindMap, resetToNewMindMap } = useStore();
  const initialLoadRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in strict mode
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    if (mindMapId) {
      // Load existing mind map
      loadMindMap(mindMapId);
    } else {
      resetToNewMindMap();
    }
  }, [mindMapId, loadMindMap, resetToNewMindMap]);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-background">
        <CanvaNav />
        <div className="flex-1">
          <Flow />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default CanvaRootLayout;
