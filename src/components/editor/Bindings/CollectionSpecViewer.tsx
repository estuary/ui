import { LinearProgress } from '@mui/material';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_inferSchemaResponseDoneProcessing,
    useBindingsEditorStore_populateInferSchemaResponse,
    useBindingsEditorStore_resetState,
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

    const resetState = useBindingsEditorStore_resetState();

    const populateInferSchemaResponse =
        useBindingsEditorStore_populateInferSchemaResponse();

    const inferSchemaResponseDoneProcessing =
        useBindingsEditorStore_inferSchemaResponseDoneProcessing();

    useEffect(() => {
        if (collectionData && currentCollection) {
            populateInferSchemaResponse(collectionData.spec, currentCollection);
        }

        return () => {
            resetState();
        };
    }, [
        collectionData,
        currentCollection,
        populateInferSchemaResponse,
        resetState,
    ]);

    if (currentBindingUUID && collectionData) {
        return (
            <>
                {inferSchemaResponseDoneProcessing ? null : <LinearProgress />}
                <ReadOnly value={collectionData.spec.key} />
                <PropertiesViewer disabled />
            </>
        );
    } else {
        return null;
    }
}

export default CollectionSpecViewer;
