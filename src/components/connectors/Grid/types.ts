import type { Dispatch, SetStateAction } from 'react';
import type { Entity, EntityWithCreateWorkflow } from 'src/types';

export interface ConnectorCardsProps {
    protocol: string | null;
    searchQuery: string | null;
    condensed?: boolean;
}

export interface ConnectorGridProps {
    condensed?: boolean;
    protocolPreset?: EntityWithCreateWorkflow;
}

export interface ConnectorSkeletonProps {
    condensed?: boolean;
}

export interface ConnectorToolbarProps {
    belowMd: boolean;
    gridSpacing: number;
    hideProtocol?: boolean;
    setProtocol: Dispatch<SetStateAction<string | null>>;
    setSearchQuery: Dispatch<SetStateAction<string | null>>;
}

export interface ProtocolOption {
    protocol: Entity | null;
    message: string;
}
