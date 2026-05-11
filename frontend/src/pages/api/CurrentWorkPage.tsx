import { useLoaderData, useRevalidator } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DraftCard from "@/components/home/DraftCard";
import type { MindMapSummary } from "@/types";

export default function CurrentWorkPage() {
  const { latestMindMap } = useLoaderData() as {
    latestMindMap: MindMapSummary | null;
  };
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const revalidator = useRevalidator();

  const handleSelect = (id: string) => {
    setSelectedId((prevId) => (prevId === id ? null : id));
  };

  const handleDelete = (deletedId: string) => {
    if (selectedId === deletedId) {
      setSelectedId(null);
    }
    revalidator.revalidate();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Current Work</h1>
        <Link to="/canva">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Mind Map
          </Button>
        </Link>
      </div>

      {!latestMindMap ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <p className="mb-4">No mind maps yet. Start your first one!</p>
          <Link to="/canva">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Create New Mind Map
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Continue where you left off
          </h2>
          <div className="max-w-md">
            <DraftCard
              id={latestMindMap.id}
              title={latestMindMap.title}
              description={latestMindMap.description}
              createdAt={latestMindMap.createdAt}
              updatedAt={latestMindMap.updatedAt}
              nodeCount={latestMindMap._count.nodes}
              edgeCount={latestMindMap._count.edges}
              isSelected={selectedId === latestMindMap.id}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
