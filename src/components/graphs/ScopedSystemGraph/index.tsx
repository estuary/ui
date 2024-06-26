import { Box } from '@mui/material';
import { useScopedSystemGraph } from 'components/shared/Entity/Details/Overview/Connections/Store/Store';
import { NodeDefinition } from 'cytoscape';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Entity } from 'types';

interface Props {
    containerId: string;
}

export type Relationship = 'parent' | 'self' | 'child';

interface GridPosition {
    row: number;
    col: number;
}

export interface NodeData {
    gridPosition: GridPosition;
    id: string;
    name: string;
    relationship: Relationship;
    type: Entity;
}

export interface Node extends NodeDefinition {
    data: NodeData;
}

function ScopedSystemGraph({ containerId }: Props) {
    const edges = useScopedSystemGraph((state) => state.edges);
    const nodes = useScopedSystemGraph((state) => state.nodes);
    const onNodeChange = useScopedSystemGraph((state) => state.onNodeChange);

    return (
        <Box style={{ height: 400, width: '100%' }}>
            <ReactFlow
                edges={edges}
                fitView
                id={containerId}
                nodes={nodes}
                onNodesChange={onNodeChange}
                snapToGrid
            >
                <Background gap={25} />
                <Controls />
            </ReactFlow>
        </Box>
    );
}

export default ScopedSystemGraph;
