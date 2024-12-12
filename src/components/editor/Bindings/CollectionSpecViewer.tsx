import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_populateInferSchemaResponse,
} from 'components/editor/Bindings/Store/hooks';
import ReadOnly from 'components/schema/KeyAutoComplete/ReadOnly';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import { useEffect } from 'react';
import {
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
} from 'stores/Binding/hooks';

function CollectionSpecViewer() {
    const currentBindingUUID = useBinding_currentBindingUUID();
    const collectionData = useBindingsEditorStore_collectionData();

    const currentCollection = useBinding_currentCollection();

    const populateInferSchemaResponse =
        useBindingsEditorStore_populateInferSchemaResponse();

    useEffect(() => {
        if (collectionData && currentCollection) {
            populateInferSchemaResponse(collectionData.spec, currentCollection);
        }
    }, [collectionData, currentCollection, populateInferSchemaResponse]);

    if (currentBindingUUID && collectionData) {
        return (
            <>
                <ReadOnly value={collectionData.spec.key} />
                <PropertiesViewer disabled />
            </>
        );
    } else {
        return null;
    }
}

export default CollectionSpecViewer;
