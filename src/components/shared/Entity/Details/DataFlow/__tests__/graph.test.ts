import type { DataFlowGraph } from 'src/components/shared/Entity/Details/DataFlow/types';

import {
    ALICE,
    CAROL,
    fixtureFetchers,
} from 'src/components/shared/Entity/Details/DataFlow/fixtures';
import {
    buildDataFlowGraph,
    getLineage,
    walkDataFlow,
} from 'src/components/shared/Entity/Details/DataFlow/graph';

const graphFor = async (centre: string, depth = 3, response = ALICE) => {
    const fetchers = fixtureFetchers(response);
    const walk = await walkDataFlow(centre, depth, fetchers);

    return { graph: buildDataFlowGraph(walk), requests: fetchers.requests };
};

const node = (graph: DataFlowGraph, id: string) =>
    graph.nodes.find((n) => n.id === id);

const edgesBetween = (graph: DataFlowGraph, source: string, target: string) =>
    graph.edges.filter((e) => e.source === source && e.target === target);

describe('walkDataFlow + buildDataFlowGraph', () => {
    test('walks upstream and downstream of a derivation', async () => {
        const { graph } = await graphFor('acmeCo/orders-enriched');

        expect(
            Object.fromEntries(graph.nodes.map((n) => [n.id, n.distance]))
        ).toEqual({
            'acmeCo/orders-enriched': 0,
            'acmeCo/customers': -1,
            'acmeCo/orders': -1,
            'acmeCo/shop-ingest': -2,
            'acmeCo/customer-totals': 1,
            'acmeCo/team/rollup': 1,
            'acmeCo/warehouse': 2,
        });
        expect(node(graph, 'acmeCo/orders-enriched')?.kind).toBe('derivation');
        expect(node(graph, 'acmeCo/shop-ingest')?.kind).toBe('capture');
        expect(node(graph, 'acmeCo/warehouse')?.kind).toBe('materialization');
        expect(graph.truncated).toBe(false);
    });

    test('omits readers the viewer cannot see', async () => {
        // otherCo/mirror reads this collection, but alice has no grant.
        const { graph } = await graphFor('acmeCo/orders-enriched');

        expect(node(graph, 'otherCo/mirror')).toBeUndefined();
    });

    test('draws one edge per transform, not per source', async () => {
        const { graph } = await graphFor('acmeCo/orders-split');
        const edges = edgesBetween(
            graph,
            'acmeCo/orders',
            'acmeCo/orders-split'
        );

        expect(edges.map((e) => e.transform?.name).sort()).toEqual([
            'bigOrders',
            'smallOrders',
        ]);
        expect(
            edges.find((e) => e.transform?.name === 'bigOrders')?.transform
        ).toMatchObject({ shuffle: { type: 'any' }, readDelay: '1h' });
    });

    test('chains derivations of derivations', async () => {
        const { graph } = await graphFor('acmeCo/orders');

        expect(node(graph, 'acmeCo/orders-enriched')?.distance).toBe(1);
        expect(node(graph, 'acmeCo/customer-totals')?.distance).toBe(2);
        expect(node(graph, 'acmeCo/warehouse')?.distance).toBe(2);
        expect(
            edgesBetween(
                graph,
                'acmeCo/orders-enriched',
                'acmeCo/customer-totals'
            )
        ).toHaveLength(1);
    });

    test('handles a self-sourcing derivation', async () => {
        const { graph } = await graphFor('acmeCo/order-dedupe');

        expect(
            edgesBetween(graph, 'acmeCo/order-dedupe', 'acmeCo/order-dedupe')
        ).toHaveLength(1);
        expect(
            graph.nodes.filter((n) => n.id === 'acmeCo/order-dedupe')
        ).toHaveLength(1);
    });

    test('shows disabled transform sources as unloaded, dashed edges', async () => {
        // legacyCustomers is disabled, so customers is not in readsFrom.
        const { graph } = await graphFor('acmeCo/customer-totals', 1);

        expect(node(graph, 'acmeCo/customers')).toMatchObject({
            access: 'unloaded',
            kind: 'collection',
            distance: -1,
        });
        expect(
            edgesBetween(graph, 'acmeCo/customers', 'acmeCo/customer-totals')
        ).toMatchObject([{ disabled: true }]);
    });

    test('renders sources the viewer cannot read as locked', async () => {
        const { graph, requests } = await graphFor(
            'acmeCo/team/rollup',
            3,
            CAROL
        );

        expect(node(graph, 'acmeCo/orders-enriched')).toMatchObject({
            access: 'locked',
            kind: 'collection',
            status: null,
        });
        // Locked names must never be sent: one would fail the whole batch.
        expect(requests.flat()).not.toContain('acmeCo/orders-enriched');
        expect(
            edgesBetween(graph, 'acmeCo/orders-enriched', 'acmeCo/team/rollup')
        ).toHaveLength(1);
    });

    test('batches each hop into one request', async () => {
        const { requests } = await graphFor('acmeCo/orders-enriched');

        expect(requests).toEqual([
            ['acmeCo/orders-enriched'],
            [
                'acmeCo/customers',
                'acmeCo/orders',
                'acmeCo/customer-totals',
                'acmeCo/team/rollup',
            ],
            ['acmeCo/shop-ingest', 'acmeCo/warehouse'],
            // Hop 3 finds nothing new, so the walk ends. Then one request for
            // every derivation's model.
            [
                'acmeCo/orders-enriched',
                'acmeCo/customer-totals',
                'acmeCo/team/rollup',
            ],
        ]);
    });

    test('flags nodes beyond the depth limit', async () => {
        const { graph } = await graphFor('acmeCo/shop-ingest', 1);

        expect(graph.truncated).toBe(true);
        expect(node(graph, 'acmeCo/orders')?.hasMore).toBe(true);
        expect(node(graph, 'acmeCo/shop-ingest')?.hasMore).toBe(false);

        const { graph: deeper } = await graphFor('acmeCo/shop-ingest', 2);
        expect(Math.max(...deeper.nodes.map((n) => n.distance))).toBe(2);
        expect(node(deeper, 'acmeCo/customer-totals')).toBeUndefined();
        expect(node(deeper, 'acmeCo/orders-enriched')?.hasMore).toBe(true);
    });

    test('stops at the node limit', async () => {
        const fetchers = fixtureFetchers(ALICE);
        const walk = await walkDataFlow('acmeCo/orders', 10, fetchers, 3);

        expect(walk.stoppedAtNodeLimit).toBe(true);
        expect(buildDataFlowGraph(walk).truncated).toBe(true);
    });

    test('marks a spec that no longer exists as missing', async () => {
        const { graph } = await graphFor('acmeCo/deleted');

        expect(graph.nodes).toMatchObject([
            { id: 'acmeCo/deleted', access: 'missing' },
        ]);
        expect(graph.edges).toEqual([]);
    });
});

describe('getLineage', () => {
    test('collects ancestors and descendants but not siblings', async () => {
        const { graph } = await graphFor('acmeCo/orders');
        const lineage = getLineage('acmeCo/orders-enriched', graph.edges);

        expect([...lineage.nodes].sort()).toEqual([
            'acmeCo/customer-totals',
            'acmeCo/orders',
            'acmeCo/orders-enriched',
            'acmeCo/shop-ingest',
            'acmeCo/team/rollup',
            'acmeCo/warehouse',
        ]);
        expect(lineage.nodes.has('acmeCo/orders-split')).toBe(false);
        expect(
            lineage.edges.has('acmeCo/orders->acmeCo/orders-split#bigOrders')
        ).toBe(false);
    });

    test('terminates on cycles', () => {
        const lineage = getLineage('a', [
            { id: 'ab', source: 'a', target: 'b' },
            { id: 'ba', source: 'b', target: 'a' },
            { id: 'aa', source: 'a', target: 'a' },
        ]);

        expect([...lineage.nodes].sort()).toEqual(['a', 'b']);
        expect([...lineage.edges].sort()).toEqual(['aa', 'ab', 'ba']);
    });
});
