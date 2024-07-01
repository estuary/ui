import { Box, IconButton, Stack, Typography } from '@mui/material';
import { ArrowRight, EditPencil } from 'iconoir-react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Entity } from 'types';
import { Relationship } from '.';

export interface EntityNodeData {
    label: string;
    relationship: Relationship;
    type: Entity;
}

function EntityNode({ data: { label } }: NodeProps<EntityNodeData>) {
    return (
        <>
            <Box>
                <IconButton>
                    <ArrowRight />
                </IconButton>

                <IconButton>
                    <EditPencil />
                </IconButton>
            </Box>

            <Stack>
                <Typography>{label}</Typography>

                <Handle type="target" position={Position.Left} />
                <Handle type="source" position={Position.Right} />
            </Stack>
        </>
    );
}

export default EntityNode;
