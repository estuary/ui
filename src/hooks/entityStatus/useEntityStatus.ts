import { useUserStore } from 'context/User/useUserContextStore';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useEntitiesStore_capabilities_readable } from 'stores/Entities/hooks';
import useSWR from 'swr';
import { getEntityStatus } from 'utils/entityStatus-utils';
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
        statusFetcher
    );

    return { data, refresh: () => mutate() };
}
