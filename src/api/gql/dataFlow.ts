import type {
    DataFlowSpecDetailsQueryQuery,
    DataFlowSpecsQueryQuery,
    StatusSummaryType,
} from 'src/gql-types/graphql';
import type { Client } from 'urql';

import { useQuery } from 'urql';

import { graphql } from 'src/gql-types';

// `liveSpecs(by: { names })` fails the whole request if any name is not
// readable, so callers must only pass names whose ref had a user capability.
const NAMES_PER_REQUEST = 100;

// Relationship lists default to 50 per spec. Past this we flag the graph as
// partial rather than paginate every spec's lists.
const REFS_PER_SPEC = 500;

// Registers the fragment with codegen; queries below spread it by name.
graphql(`
    fragment DataFlowRef on LiveSpecRef {
        catalogName
        userCapability
        status {
            type
            summary
        }
    }
`);

const DataFlowSpecsQuery = graphql(`
    query DataFlowSpecsQuery($names: [Name!]!, $refs: Int!) {
        liveSpecs(by: { names: $names }, first: 100) {
            edges {
                node {
                    ...DataFlowRef
                    liveSpec {
                        liveSpecId
                        catalogType
                        isDisabled
                        readsFrom(first: $refs) {
                            pageInfo {
                                hasNextPage
                            }
                            edges {
                                node {
                                    ...DataFlowRef
                                }
                            }
                        }
                        writesTo(first: $refs) {
                            pageInfo {
                                hasNextPage
                            }
                            edges {
                                node {
                                    ...DataFlowRef
                                }
                            }
                        }
                        readBy(first: $refs) {
                            pageInfo {
                                hasNextPage
                            }
                            edges {
                                node {
                                    ...DataFlowRef
                                }
                            }
                        }
                        writtenBy(first: $refs) {
                            pageInfo {
                                hasNextPage
                            }
                            edges {
                                node {
                                    ...DataFlowRef
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`);

// Kept separate from the walk query because `model` includes the collection
// schema, which can be large. Only derivations need it, for their transforms.
const DataFlowModelsQuery = graphql(`
    query DataFlowModelsQuery($names: [Name!]!) {
        liveSpecs(by: { names: $names }, first: 100) {
            edges {
                node {
                    catalogName
                    liveSpec {
                        liveSpecId
                        model
                    }
                }
            }
        }
    }
`);

export interface SpecRef {
    name: string;
    accessible: boolean;
}

export interface SpecRecord {
    name: string;
    catalogType: string;
    isDisabled: boolean;
    status: StatusSummaryType | null;
    statusSummary: string | null;
    readsFrom: SpecRef[];
    writesTo: SpecRef[];
    readBy: SpecRef[];
    writtenBy: SpecRef[];
    partial: boolean;
}

export type SpecsNode =
    DataFlowSpecsQueryQuery['liveSpecs']['edges'][number]['node'];

type RefConnection = NonNullable<
    NonNullable<SpecsNode['liveSpec']>['readsFrom']
>;

const toRefs = (connection: RefConnection | null | undefined): SpecRef[] =>
    connection?.edges.map(({ node }) => ({
        name: node.catalogName,
        accessible: Boolean(node.userCapability),
    })) ?? [];

export const toSpecRecord = (node: SpecsNode): SpecRecord | null => {
    const { liveSpec } = node;

    if (!liveSpec) {
        return null;
    }

    const connections = [
        liveSpec.readsFrom,
        liveSpec.writesTo,
        liveSpec.readBy,
        liveSpec.writtenBy,
    ];

    return {
        name: node.catalogName,
        catalogType: liveSpec.catalogType,
        isDisabled: liveSpec.isDisabled,
        status: node.status?.type ?? null,
        statusSummary: node.status?.summary ?? null,
        readsFrom: toRefs(liveSpec.readsFrom),
        writesTo: toRefs(liveSpec.writesTo),
        readBy: toRefs(liveSpec.readBy),
        writtenBy: toRefs(liveSpec.writtenBy),
        partial: connections.some(
            (connection) => connection?.pageInfo.hasNextPage
        ),
    };
};

const chunk = <T>(items: T[], size: number): T[][] => {
    const chunks: T[][] = [];

    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }

    return chunks;
};

export const fetchDataFlowSpecs = async (
    client: Client,
    names: string[]
): Promise<SpecRecord[]> => {
    const results = await Promise.all(
        chunk(names, NAMES_PER_REQUEST).map((batch) =>
            client
                .query(DataFlowSpecsQuery, {
                    names: batch,
                    refs: REFS_PER_SPEC,
                })
                .toPromise()
        )
    );

    return results.flatMap(({ data, error }) => {
        if (error) {
            throw error;
        }

        return (
            data?.liveSpecs.edges
                .map(({ node }) => toSpecRecord(node))
                .filter((record): record is SpecRecord => record !== null) ?? []
        );
    });
};

export const fetchDataFlowModels = async (
    client: Client,
    names: string[]
): Promise<Map<string, unknown>> => {
    const results = await Promise.all(
        chunk(names, NAMES_PER_REQUEST).map((batch) =>
            client.query(DataFlowModelsQuery, { names: batch }).toPromise()
        )
    );

    const models = new Map<string, unknown>();

    results.forEach(({ data, error }) => {
        if (error) {
            throw error;
        }

        data?.liveSpecs.edges.forEach(({ node }) => {
            if (node.liveSpec?.model) {
                models.set(node.catalogName, node.liveSpec.model);
            }
        });
    });

    return models;
};

// Everything the side panel shows beyond the graph, for one selected spec.
// Fetched on selection so the walk itself stays small.
const DataFlowSpecDetailsQuery = graphql(`
    query DataFlowSpecDetailsQuery($names: [Name!]!) {
        liveSpecs(by: { names: $names }, first: 1) {
            edges {
                node {
                    catalogName
                    activeAlerts {
                        alertType
                        firedAt
                    }
                    lastPublication {
                        publishedAt
                        userEmail
                        userFullName
                    }
                    status {
                        type
                        summary
                        connector {
                            message
                            ts
                        }
                        controller {
                            error
                            failures
                            inferredSchema {
                                schemaLastUpdated
                            }
                            autoDiscover {
                                lastSuccess {
                                    ts
                                }
                                failure {
                                    count
                                    firstTs
                                }
                            }
                        }
                    }
                    liveSpec {
                        liveSpecId
                        model
                        readsFrom(first: 500) {
                            edges {
                                node {
                                    catalogName
                                    userCapability
                                }
                            }
                        }
                        writesTo(first: 500) {
                            edges {
                                node {
                                    catalogName
                                    userCapability
                                }
                            }
                        }
                        readBy(first: 500) {
                            edges {
                                node {
                                    catalogName
                                    liveSpec {
                                        liveSpecId
                                        catalogType
                                    }
                                }
                            }
                        }
                        writtenBy(first: 500) {
                            edges {
                                node {
                                    catalogName
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`);

export type SpecDetailsNode =
    DataFlowSpecDetailsQueryQuery['liveSpecs']['edges'][number]['node'];

// Only call with a name whose ref had a user capability; see NAMES_PER_REQUEST.
export function useDataFlowSpecDetails(name: string | null) {
    const [{ data, fetching, error }] = useQuery({
        query: DataFlowSpecDetailsQuery,
        variables: { names: name ? [name] : [] },
        pause: !name,
    });

    const node = data?.liveSpecs.edges.find(
        (edge) => edge.node.catalogName === name
    )?.node;

    return { details: node ?? null, loading: fetching, error };
}
