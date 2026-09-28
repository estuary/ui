import type { DataFlowGraph } from 'src/components/shared/Entity/Details/DataFlow/types';
import type { CombinedError } from 'urql';

import { useCallback, useEffect, useState } from 'react';

import { useClient } from 'urql';

import { fetchDataFlowModels, fetchDataFlowSpecs } from 'src/api/gql/dataFlow';
import {
    buildDataFlowGraph,
    DEFAULT_DEPTH,
    DEPTH_STEP,
    walkDataFlow,
} from 'src/components/shared/Entity/Details/DataFlow/graph';

interface Result {
    key: string;
    graph: DataFlowGraph | null;
    error: CombinedError | Error | null;
}

// Walks the graph one hop per request. Repeat hops after "show more" are
// served by graphcache, so only the new frontier goes to the network.
export function useDataFlowGraph(centre: string) {
    const client = useClient();

    // Depth is keyed by centre so navigating to another spec starts over.
    const [depthState, setDepthState] = useState({
        centre,
        depth: DEFAULT_DEPTH,
    });
    const depth =
        depthState.centre === centre ? depthState.depth : DEFAULT_DEPTH;

    const [result, setResult] = useState<Result | null>(null);
    const key = `${centre}:${depth}`;

    useEffect(() => {
        let cancelled = false;

        walkDataFlow(centre, depth, {
            fetchSpecs: (names) => fetchDataFlowSpecs(client, names),
            fetchModels: (names) => fetchDataFlowModels(client, names),
        })
            .then((walk) => {
                if (!cancelled) {
                    setResult({
                        key,
                        graph: buildDataFlowGraph(walk),
                        error: null,
                    });
                }
            })
            .catch((error: CombinedError | Error) => {
                if (!cancelled) {
                    setResult({ key, graph: null, error });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [centre, client, depth, key]);

    const showMore = useCallback(() => {
        setDepthState({ centre, depth: depth + DEPTH_STEP });
    }, [centre, depth]);

    // While "show more" loads, keep showing the shallower graph for this
    // centre rather than blanking the canvas.
    const current = result?.key === key ? result : null;
    const stale =
        result?.graph?.centre === centre && !current ? result.graph : null;

    return {
        graph: current?.graph ?? stale,
        error: current?.error ?? null,
        loading: !current,
        depth,
        showMore,
    };
}
