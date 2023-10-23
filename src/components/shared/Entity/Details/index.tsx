import LiveSpecsHydrator from 'components/editor/Store/LiveSpecsHydrator';
import { createEditorStore } from 'components/editor/Store/create';
import DetailContent from 'components/shared/Entity/Details/Content';
import { LocalZustandProvider } from 'context/LocalZustand';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useMemo } from 'react';
import { EditorStoreNames } from 'stores/names';
import ShardHydrator from '../Shard/Hydrator';

function EntityDetails() {
    useBrowserTitle('routeTitle.details');

    // Generate the local store
    const localStore = useMemo(
        () => createEditorStore(EditorStoreNames.GENERAL),
        []
    );

    // Fetch params from URL
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);

    return (
        <LocalZustandProvider createStore={localStore}>
            <LiveSpecsHydrator
                collectionNames={[catalogName]}
                lastPubId={lastPubId}
                localZustandScope={true}
            >
                <ShardHydrator lastPubId={lastPubId} catalogName={catalogName}>
                    <DetailContent />
                </ShardHydrator>
            </LiveSpecsHydrator>
        </LocalZustandProvider>
    );
}

export default EntityDetails;
