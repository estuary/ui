import { Stack, Typography } from '@mui/material';
import { Handle, NodeProps, Position } from 'reactflow';
import { Entity } from 'types';
import { Relationship } from '.';
import DetailsButton from './Details';
import EditButton from './Edit';

export interface EntityNodeData {
    label: string;
    relationship: Relationship;
    type: Entity;
    childrenExist?: boolean;
    parentsExist?: boolean;
}

function EntityNode({
    data: { childrenExist, label, parentsExist, relationship, type },
    id,
}: NodeProps<EntityNodeData>) {
    return (
        <>
            <Stack
                direction="row"
                spacing="4px"
                style={{
                    padding: '0px 4px',
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    transform: 'translate(0, -50%)',
                    transformOrigin: 'center center',
                }}
            >
                <EditButton entityType={type} liveSpecId={id} />

                <DetailsButton
                    catalogName={label}
                    entityType={type}
                    relationship={relationship}
                />
            </Stack>

            <Stack
                style={{
                    alignItems: 'center',
                    backgroundColor: 'white',
                    border: '1px solid black',
                    borderRadius: 3,
                    height: 37,
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: 8,
                    width: 200,
                }}
            >
                <Typography
                    align="center"
                    noWrap
                    style={{
                        fontSize: 10,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: 184,
                    }}
                >
                    {label}
                </Typography>

                {parentsExist ? (
                    <Handle type="target" position={Position.Left} />
                ) : null}

                {childrenExist ? (
                    <Handle type="source" position={Position.Right} />
                ) : null}
            </Stack>
        </>
    );
}

export default EntityNode;
