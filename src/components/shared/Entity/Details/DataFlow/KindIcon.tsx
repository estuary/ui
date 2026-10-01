import type { DataFlowNode } from 'src/components/shared/Entity/Details/DataFlow/types';

import { Box } from '@mui/material';

import {
    CloudDownload,
    CloudUpload,
    DatabaseScript,
    GitFork,
    Lock,
    QuestionMark,
} from 'iconoir-react';

// Same icons as the navigation for captures, collections and
// materializations, so a node reads as its entity type at a glance.
const getIcon = ({ access, kind }: Pick<DataFlowNode, 'access' | 'kind'>) => {
    if (access === 'locked') {
        return Lock;
    }

    if (access === 'missing') {
        return QuestionMark;
    }

    switch (kind) {
        case 'capture':
            return CloudUpload;
        case 'materialization':
            return CloudDownload;
        case 'derivation':
            return GitFork;
        default:
            return DatabaseScript;
    }
};

export const KIND_LABELS: Record<DataFlowNode['kind'], string> = {
    capture: 'Capture',
    collection: 'Collection',
    derivation: 'Derivation',
    materialization: 'Materialization',
};

interface Props {
    node: Pick<DataFlowNode, 'access' | 'kind'>;
    size?: number;
    color?: 'inherit' | 'text.secondary';
}

export function KindIcon({ node, size = 18, color = 'text.secondary' }: Props) {
    const Icon = getIcon(node);

    return (
        <Box
            component="span"
            aria-hidden
            sx={{ display: 'flex', flexShrink: 0, color }}
        >
            <Icon width={size} height={size} />
        </Box>
    );
}
