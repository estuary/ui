import type { FetcherArgs } from 'src/hooks/entityStatus/types';

import useSWR from 'swr';

import { getEntityRelationships } from 'src/api/entityStatus';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { useEntitiesStore_capabilities_readable } from 'src/stores/Entities/hooks';

const relationshipFetcher = async ({
    0: catalogName,
    1: accessToken,
}: FetcherArgs) => {
    return await getEntityRelationships(accessToken, catalogName);
};

export const useEntityRelationships = (catalogName: string | null) => {
    const session = useUserStore((state) => state.session);

    const grants = useEntitiesStore_capabilities_readable();

    const authorizedPrefix = grants.some((grant) =>
        catalogName?.startsWith(grant)
    );

    return useSWR(
        catalogName && session?.access_token && authorizedPrefix
            ? [catalogName, session.access_token]
            : null,
        relationshipFetcher
    );
};
