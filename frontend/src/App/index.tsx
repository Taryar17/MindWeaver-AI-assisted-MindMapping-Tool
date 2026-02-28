import {
  ReactFlow,
  Controls,
  Panel,
  type NodeOrigin,
  type OnConnectStart,
  type OnConnectEnd,
  type InternalNode,
  useStoreApi,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
  Background,
  MiniMap,
} from "@xyflow/react";
import { shallow } from "zustand/shallow";
import MindMapNodes from "./MindMapNode";
import MindMapEdge from "./MindMapEdge";

import useStore, { type RFState } from "./store";

// we have to import the React Flow styles for it to work
import "@xyflow/react/dist/style.css";
import { useCallback, useRef, useState } from "react";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addChildNode: state.addChildNode,
});

const nodeOrigin: NodeOrigin = [0.5, 0.5];

const nodeTypes: NodeTypes = {
  mindmap: MindMapNodes,
};

const edgeTypes: EdgeTypes = {
  mindmap: MindMapEdge,
};

function Flow() {
  const store = useStoreApi();
  const { nodes, edges, onNodesChange, onEdgesChange, addChildNode } = useStore(
    selector,
    shallow,
  );

  const { screenToFlowPosition } = useReactFlow();

  const connectingNodeId = useRef<string | null>(null);
  const getChildNodePosition = useCallback(
    (event: MouseEvent | TouchEvent, parentNode?: InternalNode) => {
      const { domNode } = store.getState();

      if (
        !domNode ||
        // we need to check if these properties exist, because when a node is not initialized yet,
        // it doesn't have a positionAbsolute nor a width or height
        !parentNode?.internals?.positionAbsolute ||
        !parentNode?.measured?.width ||
        !parentNode?.measured?.height
      ) {
        return;
      }

      const panePosition = screenToFlowPosition({
        x: "clientX" in event ? event.clientX : event.touches[0].clientX,
        y: "clientY" in event ? event.clientY : event.touches[0].clientY,
      });

      // we are calculating with positionAbsolute here because child nodes are positioned relative to their parent
      return {
        x:
          panePosition.x -
          parentNode.internals?.positionAbsolute.x +
          parentNode.measured?.width / 2,
        y:
          panePosition.y -
          parentNode.internals?.positionAbsolute.y +
          parentNode.measured?.height / 2,
      };
    },
    [store, screenToFlowPosition],
  );

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { nodeLookup } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane",
      );
      const node = (event.target as Element).closest(".react-flow__node");

      if (node) {
        node.querySelector("input")?.focus({ preventScroll: true });
      } else if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeLookup.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);

        if (parentNode && childNodePosition) {
          addChildNode(parentNode, childNodePosition);
        }
      }
    },
    [getChildNodePosition, store, addChildNode],
  );
  const nodeColor = (node) => {
    switch (node.type) {
      case "input":
        return "#6ede87";
      case "output":
        return "#6865A5";
      default:
        return "#ff0072";
    }
  };
  const [variant, setVariant] = useState("cross");
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={nodeOrigin}
      fitView
    >
      <Controls />
      <Background color="skyblue" variant={variant} />
      <Panel position="top-left">
        Mind Weaver
        <div>variant:</div>
        <button onClick={() => setVariant("dots")}>dots</button>
        <button onClick={() => setVariant("lines")}>lines</button>
        <button onClick={() => setVariant("cross")}>cross</button>
      </Panel>
      <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
    </ReactFlow>
  );
}

export default Flow;
