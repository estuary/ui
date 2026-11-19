import type { DataPlanePrivateLinksQuery } from 'src/gql-types/graphql';

import { PRIVATE_LINKS_QUERY } from 'src/api/gql/privateLinks';
import { usePollingQuery } from 'src/api/gql/usePollingQuery';
import { useCapabilities } from 'src/hooks/useCapabilities';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { toPresentableName } from 'src/utils/dataPlane-utils';

export type PrivateLinkDataPlane =
    DataPlanePrivateLinksQuery['dataPlanes']['edges'][number]['node'] & {
        displayName: string;
        scope: 'private';
    };

/** `dataPlanes` is undefined without a result and empty for zero planes. */
export function usePrivateLinks(tenant: string, { pause }: { pause: boolean }) {
    const { data, fetching } = usePollingQuery({
        query: PRIVATE_LINKS_QUERY,
        variables: { tenant },
        pollingIntervalMs: 15000,
        pause,
    });

    const { capabilities } = useCapabilities(
        `${DATA_PLANE_SETTINGS.private.prefix}${tenant}`
    );
    // While capabilities are unknown the actions are offered and the API decides.
    const canModify =
        capabilities?.includes('ModifyDataPlanePrivateNetworking') ?? true;

    const dataPlanes: PrivateLinkDataPlane[] | undefined =
        data?.dataPlanes.edges.map(({ node }) => ({
            ...node,
            displayName: toPresentableName({
                name: node.name,
                scope: 'private',
            }),
            scope: 'private',
        }));

    return {
        dataPlanes,
        loading: fetching && !data,
        canModify,
    };
}
