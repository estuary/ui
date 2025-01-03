import { getEntityStatus } from 'api/entityStatus';
import { useUserStore } from 'context/User/useUserContextStore';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useEntitiesStore_capabilities_readable } from 'stores/Entities/hooks';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import useSWR from 'swr';
import { hasLength } from 'utils/misc-utils';

type EntityStatusFetcherArgs = [string, string];
const statusFetcher = async ({
    0: catalogName,
    1: accessToken,
}: EntityStatusFetcherArgs) => {
    const response = await getEntityStatus(accessToken, catalogName);

    return response;
};

export default function useEntityStatus(catalogName: string) {
    const session = useUserStore((state) => state.session);

    const grants = useEntitiesStore_capabilities_readable();
    const setResponse = useEntityStatusStore((state) => state.setResponse);

    const authorizedPrefix = grants.some((grant) =>
        catalogName.startsWith(grant)
    );

    if (hasLength(catalogName) && !authorizedPrefix) {
        logRocketEvent(`${CustomEvents.ENTITY_STATUS}:InvalidPrefix`, {
            catalogName,
        });
    }

    const { data, mutate } = useSWR(
        session?.access_token && authorizedPrefix
            ? [catalogName, session.access_token]
            : null,
        statusFetcher,
        {
            onSuccess: (responses) => {
                if (
                    responses.length === 1 &&
                    responses[0].catalog_name === catalogName
                ) {
                    setResponse(responses[0]);
                }
            },
        }
    );

    return { data, refresh: () => mutate() };
}
