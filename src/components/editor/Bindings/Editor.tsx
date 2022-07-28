import ResourceConfig from 'components/collection/ResourceConfig';
import {
    DetailsFormStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { ResourceConfigState } from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
}

function BindingsEditor({
    resourceConfigStoreName,
    detailsFormStoreName,
}: Props) {
    const currentCollection = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['currentCollection']
    >(resourceConfigStoreName, (state) => state.currentCollection);

    if (currentCollection) {
        return (
            <ResourceConfig
                collectionName={currentCollection}
                resourceConfigStoreName={resourceConfigStoreName}
                detailsFormStoreName={detailsFormStoreName}
            />
        );
    } else {
        return null;
    }
}

export default BindingsEditor;
