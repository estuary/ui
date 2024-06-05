import { DirectConnections, getConnectedEntities } from 'api/liveSpecFlows';
import { hasLength } from 'utils/misc-utils';
import { useSelectSingleNew } from './supabase-swr/hooks/useSelectSingle';

function useConnectedEntities(liveSpecId: string) {
    const { data, error, isValidating } = useSelectSingleNew<DirectConnections>(
        hasLength(liveSpecId) ? getConnectedEntities(liveSpecId) : null
    );

    return {
        connections: data ? data.data : null,
        error,
        isValidating,
    };
}

export default useConnectedEntities;
