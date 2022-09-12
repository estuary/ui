import ResourceConfig from 'components/collection/ResourceConfig';
import { ResourceConfigStoreNames, useZustandStore } from 'context/Zustand';
import { ResourceConfigState } from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    readOnly?: boolean;
}

function BindingsEditor({ resourceConfigStoreName, readOnly = false }: Props) {
    const currentCollection = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['currentCollection']
    >(resourceConfigStoreName, (state) => state.currentCollection);

    if (currentCollection) {
        return (
            <ResourceConfig
                collectionName={currentCollection}
                resourceConfigStoreName={resourceConfigStoreName}
                readOnly={readOnly}
            />
        );
    } else {
        return null;
    }
}

export default BindingsEditor;
