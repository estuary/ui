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
    readOnly?: boolean;
}

function BindingsEditor({
    resourceConfigStoreName,
    formStateStoreName,
    readOnly = false,
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
                readOnly={readOnly}
            />
        );
    } else {
        return null;
    }
}

export default BindingsEditor;
