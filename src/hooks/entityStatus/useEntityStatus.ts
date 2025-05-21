import type { FetcherArgs } from 'src/hooks/entityStatus/types';

import { DateTime } from 'luxon';
import useSWR from 'swr';

import { getEntityStatus } from 'src/api/entityStatus';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useEntitiesStore_capabilities_readable } from 'src/stores/Entities/hooks';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';
import { hasLength } from 'src/utils/misc-utils';

const statusFetcher = async ({
    0: catalogName,
    1: accessToken,
}: FetcherArgs) => {
    const response = await getEntityStatus(accessToken, catalogName);

    return response;
};

export default function useEntityStatus(catalogName: string) {
    const session = useUserStore((state) => state.session);

    const grants = useEntitiesStore_capabilities_readable();

    const setLastUpdated = useEntityStatusStore(
        (state) => state.setLastUpdated
    );
    const storeResponses = useEntityStatusStore((state) => state.setResponses);
    const storeError = useEntityStatusStore((state) => state.setServerError);

    const authorizedPrefix = grants.some((grant) =>
        catalogName.startsWith(grant)
    );

    if (hasLength(catalogName) && !authorizedPrefix) {
        logRocketEvent(`${CustomEvents.ENTITY_STATUS}:InvalidPrefix`, {
            catalogName,
        });
    }

    const { data, error, mutate } = useSWR(
        session?.access_token && authorizedPrefix
            ? [catalogName, session.access_token]
            : null,
        statusFetcher,
        {
            onError: (err) => {
                storeResponses(undefined);
                storeError(err);

                logRocketEvent(`${CustomEvents.ENTITY_STATUS}:CallFailed`, {
                    catalogName,
                    error: err,
                });
            },
            onSuccess: (responses) => {
                if (
                    responses.length === 1 &&
                    responses[0].catalog_name === catalogName
                ) {
                    storeResponses(responses);
                    setLastUpdated(DateTime.now());
                    storeError(null);
                }
            },
        }
    );

    return { data, error, mutate };
}
