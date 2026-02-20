import type { FetcherArgs } from 'src/hooks/entityStatus/types';

import { useMount } from 'react-use';

import { useShallow } from 'zustand/react/shallow';
import useSWR from 'swr';

import { getEntityRelationships } from 'src/api/entityStatus';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useEntitiesStore_capabilities_readable } from 'src/stores/Entities/hooks';
import { useEntityRelationshipStore } from 'src/stores/EntityRelationships/Store';

const fetcher = async ({ 0: catalogName, 1: accessToken }: FetcherArgs) => {
    return await getEntityRelationships(accessToken, catalogName);
};

export const useEntityRelationships = (
    catalogName: string | null,
    swrCacheBuster: string
) => {
    const session = useUserStore((state) => state.session);

    const grants = useEntitiesStore_capabilities_readable();

    const authorizedPrefix = grants.some((grant) =>
        catalogName?.startsWith(grant)
    );

    const [
        setActive,
        setHydrated,
        setHydrationError,
        setCaptures,
        setMaterializations,
        setCollections,
    ] = useEntityRelationshipStore(
        useShallow((state) => [
            state.setActive,
            state.setHydrated,
            state.setHydrationError,
            state.setCaptures,
            state.setMaterializations,
            state.setCollections,
        ])
    );

    // We do not really use the 'active' flag but the base hydration
    //  code does so just keeping it updated here
    useMount(() => {
        setActive(true);
    });

    return useSWR(
        catalogName && session?.access_token && authorizedPrefix
            ? [catalogName, session.access_token, swrCacheBuster]
            : null,
        fetcher,
        {
            onError: (err) => {
                setCaptures(null);
                setMaterializations(null);
                setCollections(null);

                setHydrationError(err);

                setHydrated(true);

                logRocketEvent(`${CustomEvents.ENTITY_RELATIONSHIPS}`, {
                    init: 'failed',
                });
            },
            onSuccess: (responses) => {
                const captures: string[] = [];
                const collections: string[] = [];
                const materializations: string[] = [];

                responses.forEach((datum) => {
                    if (datum.spec_type === 'capture') {
                        captures.push(datum.catalog_name);
                    } else if (datum.spec_type === 'materialization') {
                        materializations.push(datum.catalog_name);
                    } else if (datum.spec_type === 'collection') {
                        collections.push(datum.catalog_name);
                    }
                });

                setCaptures(captures);
                setMaterializations(materializations);
                setCollections(collections);

                setHydrationError(null);

                setHydrated(true);
            },
        }
    );
};
