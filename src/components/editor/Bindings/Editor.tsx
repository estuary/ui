import ResourceConfig from 'components/collection/ResourceConfig';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

interface Props {
    readOnly?: boolean;
}

function BindingsEditor({ readOnly = false }: Props) {
    const currentCollection = useResourceConfig_currentCollection();

    if (currentCollection) {
        return (
            <ResourceConfig
                collectionName={currentCollection}
                readOnly={readOnly}
            />
        );
    } else {
        return null;
    }
}

export default BindingsEditor;
