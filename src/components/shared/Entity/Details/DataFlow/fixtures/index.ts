import type { SpecsNode } from 'src/api/gql/dataFlow';
import type { DataFlowFetchers } from 'src/components/shared/Entity/Details/DataFlow/graph';

import { toSpecRecord } from 'src/api/gql/dataFlow';
import alice from 'src/components/shared/Entity/Details/DataFlow/fixtures/alice.json';
import carol from 'src/components/shared/Entity/Details/DataFlow/fixtures/carol.json';

// Real GraphQL responses captured from a local stack: `alice` owns `acmeCo/`,
// `carol` can only read `acmeCo/team/`. Bob's `otherCo/mirror` reads
// `acmeCo/orders-enriched` but never appears: `readBy` omits specs the viewer
// cannot read. Each node carries both the walk fields and `model`.
interface FixtureResponse {
    data: { liveSpecs: { edges: { node: unknown }[] } };
}

type FixtureNode = SpecsNode & { liveSpec?: { model?: unknown } | null };

export const ALICE = alice as FixtureResponse;
export const CAROL = carol as FixtureResponse;

// Serves the walk from a captured response and records every request, so
// tests can assert on batching. Like the real API, a name the viewer cannot
// read fails the whole request.
export const fixtureFetchers = (
    response: FixtureResponse
): DataFlowFetchers & { requests: string[][] } => {
    const nodes = new Map(
        response.data.liveSpecs.edges.map(({ node }) => {
            const typed = node as FixtureNode;
            return [typed.catalogName, typed];
        })
    );
    const requests: string[][] = [];

    const lookup = (names: string[]) => {
        requests.push(names);

        return names.flatMap((name) => {
            const node = nodes.get(name);

            if (node && !node.userCapability) {
                throw new Error(`PermissionDenied: ${name}`);
            }

            return node ? [node] : [];
        });
    };

    return {
        requests,
        fetchSpecs: async (names) =>
            lookup(names).flatMap((node) => toSpecRecord(node) ?? []),
        fetchModels: async (names) =>
            new Map(
                lookup(names).map((node) => [
                    node.catalogName,
                    node.liveSpec?.model,
                ])
            ),
    };
};
