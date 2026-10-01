import type { SpecRecord, SpecRef } from 'src/api/gql/dataFlow';
import type {
    DataFlowEdge,
    DataFlowGraph,
    DataFlowNode,
    DataFlowNodeKind,
    TransformInfo,
} from 'src/components/shared/Entity/Details/DataFlow/types';

import { parseTransforms } from 'src/components/shared/Entity/Details/DataFlow/transforms';

export const DEFAULT_DEPTH = 3;
export const DEPTH_STEP = 2;
const MAX_NODES = 200;

export interface DataFlowFetchers {
    fetchSpecs: (names: string[]) => Promise<SpecRecord[]>;
    fetchModels: (names: string[]) => Promise<Map<string, unknown>>;
}

// Everything the walk learned. Kept separate from the graph so the builder
// stays a pure function of what was fetched.
export interface DataFlowWalk {
    centre: string;
    depth: number;
    records: Map<string, SpecRecord>;
    // Every name reached by the walk, with its signed hop distance.
    distances: Map<string, number>;
    // Names reached through a ref with no user capability.
    locked: Set<string>;
    upstreamBoundary: Set<string>;
    downstreamBoundary: Set<string>;
    stoppedAtNodeLimit: boolean;
    models: Map<string, unknown>;
}

const upstreamRefs = (record: SpecRecord): SpecRef[] => [
    ...record.readsFrom,
    ...record.writtenBy,
];

const downstreamRefs = (record: SpecRecord): SpecRef[] => [
    ...record.readBy,
    ...record.writesTo,
];

const isDerivationRecord = (record: SpecRecord) =>
    record.catalogType === 'collection' && record.readsFrom.length > 0;

export const walkDataFlow = async (
    centre: string,
    depth: number,
    { fetchSpecs, fetchModels }: DataFlowFetchers,
    maxNodes: number = MAX_NODES
): Promise<DataFlowWalk> => {
    const records = new Map<string, SpecRecord>();
    const distances = new Map<string, number>([[centre, 0]]);
    const locked = new Set<string>();

    const fetchInto = async (names: string[]) => {
        if (names.length === 0) {
            return;
        }

        (await fetchSpecs(names)).forEach((record) => {
            // Catalog tests also show up in `readBy`; they aren't data flow.
            if (record.catalogType === 'test') {
                distances.delete(record.name);
            } else {
                records.set(record.name, record);
            }
        });
    };

    await fetchInto([centre]);

    let upFrontier = records.has(centre) ? [centre] : [];
    let downFrontier = [...upFrontier];
    let stoppedAtNodeLimit = false;

    for (let hop = 1; hop <= depth; hop += 1) {
        const discover = (
            frontier: string[],
            getRefs: (record: SpecRecord) => SpecRef[],
            sign: 1 | -1
        ) => {
            const next = new Set<string>();

            frontier.forEach((name) => {
                const record = records.get(name);

                if (!record) {
                    return;
                }

                getRefs(record).forEach((ref) => {
                    if (distances.has(ref.name)) {
                        return;
                    }

                    next.add(ref.name);
                    if (!ref.accessible) {
                        locked.add(ref.name);
                    }
                });
            });

            next.forEach((name) => distances.set(name, hop * sign));

            return [...next];
        };

        if (distances.size >= maxNodes) {
            stoppedAtNodeLimit = true;
            break;
        }

        const nextUp = discover(upFrontier, upstreamRefs, -1);
        const nextDown = discover(downFrontier, downstreamRefs, 1);

        await fetchInto(
            [...nextUp, ...nextDown].filter((name) => !locked.has(name))
        );

        // Locked and missing specs have no refs to follow.
        upFrontier = nextUp.filter((name) => records.has(name));
        downFrontier = nextDown.filter((name) => records.has(name));

        if (upFrontier.length === 0 && downFrontier.length === 0) {
            break;
        }
    }

    const derivations = [...records.values()]
        .filter(isDerivationRecord)
        .map(({ name }) => name);

    return {
        centre,
        depth,
        records,
        distances,
        locked,
        upstreamBoundary: new Set(upFrontier),
        downstreamBoundary: new Set(downFrontier),
        stoppedAtNodeLimit,
        models: await fetchModels(derivations),
    };
};

const getKind = (
    record: SpecRecord | undefined,
    transforms: TransformInfo[] | null
): DataFlowNodeKind => {
    switch (record?.catalogType) {
        case 'capture':
            return 'capture';
        case 'materialization':
            return 'materialization';
        default:
            // Unfetched nodes are only ever reached as sources, so they are
            // collections. Readers of a collection are never locked: the
            // backend omits readers the user cannot see.
            return transforms || (record && isDerivationRecord(record))
                ? 'derivation'
                : 'collection';
    }
};

export const buildDataFlowGraph = (walk: DataFlowWalk): DataFlowGraph => {
    const { records, distances, locked, models, depth } = walk;

    const transformsByName = new Map<string, TransformInfo[]>();
    models.forEach((model, name) => {
        const transforms = parseTransforms(model);
        if (transforms) {
            transformsByName.set(name, transforms);
        }
    });

    // Disabled transforms are left out of `readsFrom`, so the walk never
    // reached their sources. Show them as unloaded placeholders, but only
    // where the walk itself went upstream from the derivation.
    const unloaded = new Set<string>();
    transformsByName.forEach((transforms, name) => {
        const distance = distances.get(name);

        if (distance === undefined || distance > 0 || -distance >= depth) {
            return;
        }

        transforms.forEach((transform) => {
            if (transform.disabled && !distances.has(transform.source)) {
                unloaded.add(transform.source);
                distances.set(transform.source, distance - 1);
            }
        });
    });

    const hasMore = (name: string) => {
        const record = records.get(name);

        if (!record) {
            return false;
        }

        const refs = [
            ...(walk.upstreamBoundary.has(name) ? upstreamRefs(record) : []),
            ...(walk.downstreamBoundary.has(name)
                ? downstreamRefs(record)
                : []),
        ];

        return refs.some((ref) => !distances.has(ref.name));
    };

    const nodes: DataFlowNode[] = [...distances.entries()].map(
        ([name, distance]) => {
            const record = records.get(name);
            const transforms = transformsByName.get(name) ?? null;

            return {
                id: name,
                kind: getKind(record, transforms),
                access: record
                    ? 'ok'
                    : locked.has(name)
                      ? 'locked'
                      : unloaded.has(name)
                        ? 'unloaded'
                        : 'missing',
                status: record?.status ?? null,
                statusSummary: record?.statusSummary ?? null,
                isDisabled: record?.isDisabled ?? false,
                distance,
                hasMore: hasMore(name),
                transforms,
            };
        }
    );

    const edges = new Map<string, DataFlowEdge>();
    const addEdge = (edge: Omit<DataFlowEdge, 'id'>) => {
        if (!distances.has(edge.source) || !distances.has(edge.target)) {
            return;
        }

        const id = `${edge.source}->${edge.target}${
            edge.transform ? `#${edge.transform.name}` : ''
        }`;

        edges.set(id, { ...edge, id });
    };

    // Edges come from the task side of each relationship: collections' own
    // `readBy` / `writtenBy` lists are only used to walk.
    records.forEach((record) => {
        const transforms = transformsByName.get(record.name);

        if (record.catalogType === 'capture') {
            record.writesTo.forEach((ref) =>
                addEdge({
                    source: record.name,
                    target: ref.name,
                    kind: 'capture',
                    transform: null,
                    disabled: false,
                })
            );
        } else if (record.catalogType === 'materialization') {
            record.readsFrom.forEach((ref) =>
                addEdge({
                    source: ref.name,
                    target: record.name,
                    kind: 'materialization',
                    transform: null,
                    disabled: false,
                })
            );
        } else if (transforms) {
            // One edge per transform: two transforms reading the same
            // source are two edges.
            transforms.forEach((transform) =>
                addEdge({
                    source: transform.source,
                    target: record.name,
                    kind: 'transform',
                    transform,
                    disabled: transform.disabled,
                })
            );
        } else {
            record.readsFrom.forEach((ref) =>
                addEdge({
                    source: ref.name,
                    target: record.name,
                    kind: 'transform',
                    transform: null,
                    disabled: false,
                })
            );
        }
    });

    return {
        centre: walk.centre,
        nodes,
        edges: [...edges.values()],
        truncated:
            walk.stoppedAtNodeLimit || nodes.some((node) => node.hasMore),
        partial: [...records.values()].some((record) => record.partial),
    };
};

export interface Lineage {
    nodes: Set<string>;
    edges: Set<string>;
}

// All ancestors and descendants of a node. Cycles are safe: each node is
// visited once per direction.
export const getLineage = (
    nodeId: string,
    edges: Pick<DataFlowEdge, 'id' | 'source' | 'target'>[]
): Lineage => {
    const walk = (
        from: 'source' | 'target',
        to: 'source' | 'target'
    ): Set<string> => {
        const seen = new Set<string>([nodeId]);
        const queue = [nodeId];

        while (queue.length > 0) {
            const current = queue.shift();

            edges.forEach((edge) => {
                if (edge[from] === current && !seen.has(edge[to])) {
                    seen.add(edge[to]);
                    queue.push(edge[to]);
                }
            });
        }

        return seen;
    };

    const ancestors = walk('target', 'source');
    const descendants = walk('source', 'target');

    return {
        nodes: new Set([...ancestors, ...descendants]),
        edges: new Set(
            edges
                .filter(
                    ({ source, target }) =>
                        (ancestors.has(source) && ancestors.has(target)) ||
                        (descendants.has(source) && descendants.has(target))
                )
                .map(({ id }) => id)
        ),
    };
};
