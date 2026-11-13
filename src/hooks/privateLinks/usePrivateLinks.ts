import type { CapabilityBundle } from 'src/gql-types/graphql';
import type { CloudProvider } from 'src/utils/cloudRegions';
import type { PrivateLink } from 'src/utils/private-link-utils';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useQuery } from 'urql';

import {
    PRIVATE_LINK_CAPABILITIES_QUERY,
    PRIVATE_LINKS_QUERY,
} from 'src/api/gql/privateLinks';
import { usePollingQuery } from 'src/api/gql/usePollingQuery';
import { DATA_PLANE_PREFIX } from 'src/settings/dataPlanes';
import { toPresentableName } from 'src/utils/dataPlane-utils';

// The data plane applies a change over several minutes, and reports nothing
// in between.
const PENDING_POLL_MS = 15000;

export interface PrivateLinkDataPlane {
    name: string;
    displayName: string;
    cloudProvider: CloudProvider;
    region: string;
    // Whether the API returns this data plane's links to the user. Without it
    // `links` is empty, whatever links the data plane has.
    canView: boolean;
    // Whether the user may add, edit and remove this data plane's links.
    canModify: boolean;
    links: PrivateLink[];
}

// A tenant's private data planes are named under `ops/dp/private/<tenant>/`,
// so a grant that covers one sits on that prefix, on one within it, or on one
// above it: [`ops/`, `ops/dp/`, `ops/dp/private/`].
function getGrantPrefixes(tenant: string) {
    const within = `${DATA_PLANE_PREFIX}private/${tenant}`;
    const segments = within.split('/').filter(Boolean).slice(0, -1);

    return {
        above: segments.map(
            (_segment, index) => `${segments.slice(0, index + 1).join('/')}/`
        ),
        within,
    };
}

// A failed refetch returns no data. Holding on to what was last loaded keeps
// one failed poll from emptying the list, closing the dialogs that read from
// it, and ending the polling that would recover.
function useLastLoaded<T>(data: T | undefined): T | undefined {
    const lastLoaded = useRef(data);
    if (data !== undefined) {
        lastLoaded.current = data;
    }

    return lastLoaded.current;
}

/**
 * The tenant's private data planes with their private links. Links still
 * being provisioned are polled until they settle. Callers remount when the
 * tenant changes, so no earlier tenant's links are retained here.
 */
export function usePrivateLinks(tenant: string) {
    const [polling, setPolling] = useState(false);

    const linksQuery = usePollingQuery({
        query: PRIVATE_LINKS_QUERY,
        variables: { tenant },
        pollingIntervalMs: polling ? PENDING_POLL_MS : undefined,
    });
    const data = useLastLoaded(linksQuery.data);

    const prefixes = useMemo(() => getGrantPrefixes(tenant), [tenant]);
    const [capabilitiesQuery] = useQuery({
        query: PRIVATE_LINK_CAPABILITIES_QUERY,
        variables: prefixes,
    });
    const capabilities = useLastLoaded(capabilitiesQuery.data);

    const dataPlanes = useMemo<PrivateLinkDataPlane[]>(() => {
        const grants = capabilities
            ? [...capabilities.above.edges, ...capabilities.within.edges]
            : [];
        const nodes = data?.dataPlanes.edges ?? [];

        // Each check is a bundle of one permission, so holding it on any
        // prefix of the data plane's name is holding that permission.
        const holds = (name: string, bundle: CapabilityBundle) =>
            grants.some(
                ({ node: grant }) =>
                    name.startsWith(grant.prefix) &&
                    grant.capabilities.includes(bundle)
            );

        // Links are made in a cloud, which a LOCAL development data plane
        // lacks.
        return nodes.flatMap(({ node }) =>
            node.cloudProvider === 'LOCAL'
                ? []
                : {
                      name: node.name,
                      displayName: toPresentableName({
                          name: node.name,
                          scope: 'private',
                      }),
                      cloudProvider: node.cloudProvider,
                      region: node.region,
                      // Until the bundles are known, take the API's word for
                      // which links there are.
                      canView:
                          !capabilities ||
                          holds(node.name, 'ViewDataPlanePrivateNetworking'),
                      canModify: holds(
                          node.name,
                          'ModifyDataPlanePrivateNetworking'
                      ),
                      links: node.privateLinks,
                  }
        );
    }, [capabilities, data]);

    const hasPending = dataPlanes.some(({ links }) =>
        links.some(({ status }) => status === 'PENDING')
    );
    useEffect(() => setPolling(hasPending), [hasPending]);

    return {
        dataPlanes,
        // What the user may do is part of what is shown, so wait for both.
        isLoading:
            (linksQuery.fetching && !data) ||
            (capabilitiesQuery.fetching && !capabilities),
        // With `isLoaded` this is a failed refresh of the links on screen.
        error: linksQuery.error,
        isLoaded: Boolean(data),
        // Without capabilities the links are still worth showing, read-only.
        capabilitiesError: capabilities ? undefined : capabilitiesQuery.error,
    };
}
