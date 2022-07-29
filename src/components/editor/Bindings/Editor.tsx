import ResourceConfig from 'components/collection/ResourceConfig';
import {
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { ResourceConfigState } from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    formStateStoreName: FormStateStoreNames;
}

function BindingsEditor({
    resourceConfigStoreName,
    formStateStoreName,
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
                formStateStoreName={formStateStoreName}
            />
        );
    } else {
        return null;
    }
}

export default BindingsEditor;
