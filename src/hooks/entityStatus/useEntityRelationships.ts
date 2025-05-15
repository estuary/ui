import type { FetcherArgs } from 'src/hooks/entityStatus/types';

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
    ] = useEntityRelationshipStore((state) => [
        state.setActive,
        state.setHydrated,
        state.setHydrationError,
        state.setCaptures,
        state.setMaterializations,
    ]);

    return useSWR(
        catalogName && session?.access_token && authorizedPrefix
            ? [catalogName, session.access_token, swrCacheBuster]
            : null,
        fetcher,
        {
            onError: (err) => {
                setCaptures(null);
                setMaterializations(null);

                setHydrationError(err);

                setActive(false);
                setHydrated(true);

                logRocketEvent(`${CustomEvents.ENTITY_RELATIONSHIPS}`, {
                    init: 'failed',
                });
            },
            onSuccess: (responses) => {
                const captures: any[] = [];
                const materializations: any[] = [];

                responses.forEach((datum) => {
                    if (datum.spec_type === 'capture') {
                        captures.push(datum.catalog_name);
                    } else if (datum.spec_type === 'materialization') {
                        materializations.push(datum.catalog_name);
                    }
                });

                setCaptures(captures);
                setMaterializations(materializations);

                setHydrationError(null);

                setActive(false);
                setHydrated(true);
            },
        }
    );
};
