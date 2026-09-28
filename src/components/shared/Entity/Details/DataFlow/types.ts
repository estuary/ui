import type { StatusSummaryType } from 'src/gql-types/graphql';

export type DataFlowNodeKind =
    | 'capture'
    | 'collection'
    | 'derivation'
    | 'materialization';

// `locked`: the user has no capability to the spec, so only its name is known.
// `missing`: the user has access but no live spec was returned (e.g. deleted).
// `unloaded`: only a disabled transform points at it, so it was not fetched.
type DataFlowNodeAccess = 'ok' | 'locked' | 'missing' | 'unloaded';

export type TransformShuffle =
    | { type: 'any' }
    | { type: 'key'; key: string[] }
    | { type: 'lambda' }
    | { type: 'default' };

// Only the parts of a derivation transform this view reads. The spec shape in
// `deps/flow/flow.d.ts` and `Transform` in `src/types` are both out of date.
export interface TransformInfo {
    name: string;
    source: string;
    shuffle: TransformShuffle;
    readDelay: string | null;
    priority: number | null;
    hasPartitionSelector: boolean;
    notBefore: string | null;
    notAfter: string | null;
    disabled: boolean;
}

export interface DataFlowNode {
    id: string;
    kind: DataFlowNodeKind;
    access: DataFlowNodeAccess;
    status: StatusSummaryType | null;
    statusSummary: string | null;
    isDisabled: boolean;
    // Hops from the centre spec: negative upstream, positive downstream.
    distance: number;
    // Neighbours exist beyond the depth limit in the direction walked.
    hasMore: boolean;
    transforms: TransformInfo[] | null;
}

type DataFlowEdgeKind = 'capture' | 'transform' | 'materialization';

export interface DataFlowEdge {
    id: string;
    source: string;
    target: string;
    kind: DataFlowEdgeKind;
    transform: TransformInfo | null;
    disabled: boolean;
}

export interface DataFlowGraph {
    centre: string;
    nodes: DataFlowNode[];
    edges: DataFlowEdge[];
    // The walk stopped at the depth or node limit with more to show.
    truncated: boolean;
    // A relationship list hit the per-spec page size and was cut short.
    partial: boolean;
}
