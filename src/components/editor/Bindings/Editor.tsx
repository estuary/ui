import ResourceConfig from 'components/collection/ResourceConfig';
import { useRouteStore } from 'hooks/useRouteStore';
import { entityCreateStoreSelectors } from 'stores/Create';

function BindingsEditor() {
    const useEntityCreateStore = useRouteStore();
    const currentCollection = useEntityCreateStore(
        entityCreateStoreSelectors.collections.current.get
    );

    if (currentCollection) {
        return <ResourceConfig collectionName={currentCollection} />;
    } else {
        return null;
    }
}

export default BindingsEditor;
