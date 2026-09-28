export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 56;
const GAP_X = 96;
const GAP_Y = 24;
// Leaves room above the top row for self-loops and the centre label.
const PADDING = 48;
// Vertical space per back edge routed above the layers.
export const BACK_EDGE_LANE = 18;
const BARYCENTRE_SWEEPS = 4;
// Height of the lane a long edge takes where it crosses a layer.
const VIRTUAL_HEIGHT = 8;

interface LayoutEdge {
    id: string;
    source: string;
    target: string;
}

interface NodePosition {
    x: number;
    y: number;
    rank: number;
    order: number;
}

export interface GraphLayout {
    positions: Map<string, NodePosition>;
    width: number;
    height: number;
    // Edges that close a cycle, mapped to the lane they are routed in above
    // the graph. Their direction is kept; only the layering ignores them.
    backEdges: Map<string, number>;
    selfLoops: Set<string>;
    // For edges spanning several layers: where the edge crosses each layer
    // in between (left edge of the layer, vertical centre of its lane).
    waypoints: Map<string, { x: number; y: number }[]>;
}

const mean = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;

// Layered left-to-right layout. `nodeIds` order is the tie-breaker everywhere,
// so the same input always produces the same layout.
export const layoutGraph = (
    nodeIds: string[],
    edges: LayoutEdge[]
): GraphLayout => {
    const known = new Set(nodeIds);
    const usable = edges.filter(
        ({ source, target }) => known.has(source) && known.has(target)
    );

    const selfLoops = new Set(
        usable
            .filter(({ source, target }) => source === target)
            .map(({ id }) => id)
    );

    const outgoing = new Map<string, LayoutEdge[]>(
        nodeIds.map((id) => [id, []])
    );
    const inDegree = new Map<string, number>(nodeIds.map((id) => [id, 0]));

    usable.forEach((edge) => {
        if (selfLoops.has(edge.id)) {
            return;
        }

        outgoing.get(edge.source)?.push(edge);
        inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    });

    // DFS from roots first so the edges that close cycles are the ones
    // pointing back towards the sources, not an arbitrary edge of the cycle.
    const backEdgeIds: string[] = [];
    const state = new Map<string, 'active' | 'done'>();
    const visit = (id: string) => {
        state.set(id, 'active');

        outgoing.get(id)?.forEach((edge) => {
            const targetState = state.get(edge.target);

            if (targetState === 'active') {
                backEdgeIds.push(edge.id);
            } else if (!targetState) {
                visit(edge.target);
            }
        });

        state.set(id, 'done');
    };

    [...nodeIds.filter((id) => inDegree.get(id) === 0), ...nodeIds].forEach(
        (id) => {
            if (!state.has(id)) {
                visit(id);
            }
        }
    );

    const backEdgeSet = new Set(backEdgeIds);
    const dagEdges = usable.filter(
        ({ id }) => !selfLoops.has(id) && !backEdgeSet.has(id)
    );

    // Rank = longest path from a root, via Kahn's algorithm over the DAG.
    const rank = new Map<string, number>(nodeIds.map((id) => [id, 0]));
    const remaining = new Map<string, number>(nodeIds.map((id) => [id, 0]));
    const dagOut = new Map<string, string[]>(nodeIds.map((id) => [id, []]));

    dagEdges.forEach(({ source, target }) => {
        dagOut.get(source)?.push(target);
        remaining.set(target, (remaining.get(target) ?? 0) + 1);
    });

    const queue = nodeIds.filter((id) => remaining.get(id) === 0);
    while (queue.length > 0) {
        const id = queue.shift() as string;

        dagOut.get(id)?.forEach((target) => {
            rank.set(
                target,
                Math.max(rank.get(target) ?? 0, (rank.get(id) ?? 0) + 1)
            );

            const left = (remaining.get(target) ?? 0) - 1;
            remaining.set(target, left);
            if (left === 0) {
                queue.push(target);
            }
        });
    }

    const maxRank = Math.max(0, ...rank.values());
    const layers: string[][] = Array.from({ length: maxRank + 1 }, () => []);
    nodeIds.forEach((id) => layers[rank.get(id) ?? 0].push(id));

    // Edges spanning several layers get a virtual node in each layer they
    // cross. Virtual nodes take part in ordering, so long edges are routed
    // around the nodes in between instead of straight through them.
    const virtualIds = new Set<string>();
    const chains = new Map<string, string[]>();
    const segmentIn = new Map<string, string[]>(nodeIds.map((id) => [id, []]));
    const segmentOut = new Map<string, string[]>(nodeIds.map((id) => [id, []]));

    dagEdges.forEach((edge) => {
        const chain: string[] = [];
        let previous = edge.source;

        for (
            let layerRank = (rank.get(edge.source) ?? 0) + 1;
            layerRank < (rank.get(edge.target) ?? 0);
            layerRank += 1
        ) {
            const virtualId = `\u0000${edge.id}\u0000${layerRank}`;

            virtualIds.add(virtualId);
            layers[layerRank].push(virtualId);
            chain.push(virtualId);
            segmentIn.set(virtualId, [previous]);
            segmentOut.set(virtualId, []);
            segmentOut.get(previous)?.push(virtualId);
            previous = virtualId;
        }

        segmentOut.get(previous)?.push(edge.target);
        segmentIn.get(edge.target)?.push(previous);

        if (chain.length > 0) {
            chains.set(edge.id, chain);
        }
    });

    const order = new Map<string, number>();
    layers.forEach((layer) =>
        layer.forEach((id, index) => order.set(id, index))
    );

    // Barycentre ordering: sort each layer by the mean position of its
    // neighbours, alternating direction, to cut edge crossings.
    const sortLayer = (layer: string[], neighbours: Map<string, string[]>) => {
        const keys = new Map(
            layer.map((id) => {
                const adjacent = neighbours.get(id) ?? [];

                return [
                    id,
                    adjacent.length > 0
                        ? mean(adjacent.map((n) => order.get(n) ?? 0))
                        : (order.get(id) ?? 0),
                ];
            })
        );

        layer.sort((a, b) => (keys.get(a) ?? 0) - (keys.get(b) ?? 0));
        layer.forEach((id, index) => order.set(id, index));
    };

    for (let sweep = 0; sweep < BARYCENTRE_SWEEPS; sweep += 1) {
        if (sweep % 2 === 0) {
            layers.slice(1).forEach((layer) => sortLayer(layer, segmentIn));
        } else {
            layers
                .slice(0, -1)
                .reverse()
                .forEach((layer) => sortLayer(layer, segmentOut));
        }
    }

    const heightOf = (id: string) =>
        virtualIds.has(id) ? VIRTUAL_HEIGHT : NODE_HEIGHT;
    const layerHeights = layers.map(
        (layer) =>
            layer.reduce((sum, id) => sum + heightOf(id), 0) +
            Math.max(0, layer.length - 1) * GAP_Y
    );
    const columnHeight = Math.max(NODE_HEIGHT, ...layerHeights);
    const top = PADDING + backEdgeIds.length * BACK_EDGE_LANE;

    const positions = new Map<string, NodePosition>();
    const virtualPositions = new Map<string, { x: number; y: number }>();
    layers.forEach((layer, layerRank) => {
        const x = PADDING + layerRank * (NODE_WIDTH + GAP_X);
        let y = top + (columnHeight - layerHeights[layerRank]) / 2;

        layer.forEach((id, index) => {
            if (virtualIds.has(id)) {
                virtualPositions.set(id, { x, y: y + VIRTUAL_HEIGHT / 2 });
            } else {
                positions.set(id, { x, y, rank: layerRank, order: index });
            }

            y += heightOf(id) + GAP_Y;
        });
    });

    const waypoints = new Map<string, { x: number; y: number }[]>();
    chains.forEach((chain, edgeId) => {
        waypoints.set(
            edgeId,
            chain.flatMap((id) => virtualPositions.get(id) ?? [])
        );
    });

    return {
        positions,
        width: PADDING * 2 + layers.length * NODE_WIDTH + maxRank * GAP_X,
        height: top + columnHeight + PADDING,
        backEdges: new Map(backEdgeIds.map((id, lane) => [id, lane])),
        selfLoops,
        waypoints,
    };
};
