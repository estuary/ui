import type { RequestPolicy } from 'urql';

import { isEqual } from 'lodash';
import { useQuery } from 'urql';

import { graphql } from 'src/gql-types';

// `none` keeps every prefix a grant lands on. `read` would drop prefixes whose permissions do not cover the `Viewer` bundle, such as a grant of only `EditSecret`.
const CAPABILITIES_QUERY = graphql(`
    query Capabilities($prefixes: [String!]!) {
        prefixes(
            by: { minCapability: none }
            filter: { prefix: { in: $prefixes } }
        ) {
            edges {
                node {
                    capabilities
                }
            }
        }
    }
`);

/**
 * Bundles held through grants on the prefixes `name` sits under, combined.
 * Capabilities are unknown until those prefixes have a result, after a failed
 * query, or when the name has no prefix to query.
 *
 * Check single-permission bundles: combining prefix rows can omit a bundle
 * whose permissions come from grants on different prefixes.
 */
export function useCapabilities(
    name: string,
    options?: { requestPolicy?: RequestPolicy }
) {
    const prefixes = getAncestorPrefixes(name);

    const paused = prefixes.length === 0;
    const [{ data, fetching, error, operation }] = useQuery({
        query: CAPABILITIES_QUERY,
        variables: { prefixes },
        requestPolicy: options?.requestPolicy,
        pause: paused,
    });

    const isCurrent =
        !paused && isEqual(operation?.variables.prefixes, prefixes);
    const capabilities =
        isCurrent && !error
            ? data?.prefixes.edges.flatMap(({ node }) => node.capabilities)
            : undefined;

    return {
        capabilities,
        fetching: !paused && (!isCurrent || fetching),
        error: isCurrent ? error : undefined,
    };
}

// The prefixes a name sits under, e.g. `acmeCo/team/key` -> [`acmeCo/`, `acmeCo/team/`], and `acmeCo/` -> [`acmeCo/`].
function getAncestorPrefixes(name: string): string[] {
    const segments = name.split('/').slice(0, -1);
    return segments.map(
        (_segment, index) => `${segments.slice(0, index + 1).join('/')}/`
    );
}
