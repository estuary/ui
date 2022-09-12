import ResourceConfig from 'components/collection/ResourceConfig';
import { ResourceConfigStoreNames } from 'context/Zustand';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    readOnly?: boolean;
}

function BindingsEditor({ resourceConfigStoreName, readOnly = false }: Props) {
    const currentCollection = useResourceConfig_currentCollection();

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
