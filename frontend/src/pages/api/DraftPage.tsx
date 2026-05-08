// pages/api/DraftPage.tsx
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useState } from "react";
import DraftCard from "@/components/home/DraftCard";
import type { MindMapSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export default function DraftsPage() {
  const { mindMaps } = useLoaderData() as { mindMaps: MindMapSummary[] };
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const revalidator = useRevalidator();

  const handleSelect = (id: string) => {
    setSelectedId((prevId) => (prevId === id ? null : id));
  };

  const handleDelete = (deletedId: string) => {
    if (selectedId === deletedId) {
      setSelectedId(null);
    }
    // Revalidate the loader data
    revalidator.revalidate();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Drafts</h1>
        <Link to="/canva">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Mind Map
          </Button>
        </Link>
      </div>

      {mindMaps.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <p className="mb-4">No drafts yet. Create your first mind map!</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mindMaps.map((mindMap) => (
            <DraftCard
              key={mindMap.id}
              id={mindMap.id}
              title={mindMap.title}
              description={mindMap.description}
              createdAt={mindMap.createdAt}
              updatedAt={mindMap.updatedAt}
              nodeCount={mindMap._count.nodes}
              edgeCount={mindMap._count.edges}
              isSelected={selectedId === mindMap.id}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
