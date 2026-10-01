import {
    layoutGraph,
    NODE_HEIGHT,
} from 'src/components/shared/Entity/Details/DataFlow/layout';

const edge = (source: string, target: string, suffix = '') => ({
    id: `${source}->${target}${suffix}`,
    source,
    target,
});

const ranks = (layout: ReturnType<typeof layoutGraph>) =>
    Object.fromEntries(
        [...layout.positions.entries()].map(([id, { rank }]) => [id, rank])
    );

describe('layoutGraph', () => {
    test('ranks by longest path from the roots', () => {
        const layout = layoutGraph(
            ['cap', 'a', 'b', 'd1', 'd2', 'mat'],
            [
                edge('cap', 'a'),
                edge('cap', 'b'),
                edge('a', 'd1'),
                edge('d1', 'd2'),
                edge('b', 'd2'),
                edge('d2', 'mat'),
                // Skips a layer; mat must still sit after d2.
                edge('a', 'mat'),
            ]
        );

        expect(ranks(layout)).toEqual({
            cap: 0,
            a: 1,
            b: 1,
            d1: 2,
            d2: 3,
            mat: 4,
        });
        expect(layout.backEdges.size).toBe(0);
    });

    test('routes an edge that skips layers through a lane in each', () => {
        const layout = layoutGraph(
            ['a', 'b', 'c', 'd'],
            [edge('a', 'b'), edge('b', 'c'), edge('c', 'd'), edge('a', 'd')]
        );

        const lanes = layout.waypoints.get('a->d') ?? [];
        expect(lanes).toHaveLength(2);
        expect(lanes.map(({ x }) => x)).toEqual([
            layout.positions.get('b')?.x,
            layout.positions.get('c')?.x,
        ]);

        // The lane must not overlap the real node in its layer.
        const b = layout.positions.get('b');
        const [lane] = lanes;
        expect(lane.y < (b?.y ?? 0) || lane.y > (b?.y ?? 0) + NODE_HEIGHT).toBe(
            true
        );
        expect(layout.waypoints.has('a->b')).toBe(false);
    });

    test('breaks a cycle with a back edge instead of failing', () => {
        const layout = layoutGraph(
            ['src', 'x', 'y'],
            [edge('src', 'x'), edge('x', 'y'), edge('y', 'x')]
        );

        expect(ranks(layout)).toEqual({ src: 0, x: 1, y: 2 });
        expect([...layout.backEdges.keys()]).toEqual(['y->x']);
    });

    test('treats a self-loop separately from ranking', () => {
        const layout = layoutGraph(
            ['orders', 'dedupe'],
            [edge('orders', 'dedupe'), edge('dedupe', 'dedupe')]
        );

        expect(ranks(layout)).toEqual({ orders: 0, dedupe: 1 });
        expect([...layout.selfLoops]).toEqual(['dedupe->dedupe']);
        expect(layout.backEdges.size).toBe(0);
    });

    test('keeps parallel edges between the same pair', () => {
        const layout = layoutGraph(
            ['orders', 'split'],
            [edge('orders', 'split', '#a'), edge('orders', 'split', '#b')]
        );

        expect(ranks(layout)).toEqual({ orders: 0, split: 1 });
    });

    test('orders a layer by the barycentre of its neighbours', () => {
        // Initial order puts d2 above d1, which would cross the edges.
        const layout = layoutGraph(
            ['a', 'b', 'd2', 'd1'],
            [edge('a', 'd1'), edge('b', 'd2')]
        );

        const y = (id: string) => layout.positions.get(id)?.y ?? 0;
        expect(y('a')).toBeLessThan(y('b'));
        expect(y('d1')).toBeLessThan(y('d2'));
    });

    test('reserves a lane above the graph for each back edge', () => {
        const withCycle = layoutGraph(
            ['x', 'y'],
            [edge('x', 'y'), edge('y', 'x')]
        );
        const without = layoutGraph(['x', 'y'], [edge('x', 'y')]);

        expect(withCycle.height).toBeGreaterThan(without.height);
        expect(withCycle.positions.get('x')?.y).toBeGreaterThan(
            without.positions.get('x')?.y ?? 0
        );
    });

    test('ignores edges to unknown nodes and lays out an empty graph', () => {
        const layout = layoutGraph(['a'], [edge('a', 'ghost')]);
        expect(ranks(layout)).toEqual({ a: 0 });

        const empty = layoutGraph([], []);
        expect(empty.positions.size).toBe(0);
        expect(empty.height).toBeGreaterThanOrEqual(NODE_HEIGHT);
    });
});
