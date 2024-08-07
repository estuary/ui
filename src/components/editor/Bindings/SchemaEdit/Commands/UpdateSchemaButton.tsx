import { Box, Button } from '@mui/material';
import {
    useBindingsEditorStore_schemaUpdating,
    useBindingsEditorStore_updateSchema,
} from 'components/editor/Bindings/Store/hooks';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useUnmount } from 'react-use';
import { useBinding_currentCollection } from 'stores/Binding/hooks';

function UpdateSchemaButton() {
    const currentCollection = useBinding_currentCollection();

    const updateSchema = useBindingsEditorStore_updateSchema();
    const schemaUpdating = useBindingsEditorStore_schemaUpdating();

    const persistedDraftId = useEditorStore_persistedDraftId();

    // TODO (optimization): Equip stores with the proper tools to clean up after themselves; this includes managing the promises they create.
    //   Below is a very hacky workaround that is intended to be temporary.
    const [schemaPromise, setSchemaPromise] = useState<Promise<void> | null>(
        null
    );

    const updateCollectionSchema = () => {
        const promise = updateSchema(currentCollection, persistedDraftId);

        setSchemaPromise(promise);
    };

    useUnmount(() => {
        if (schemaPromise !== null) {
            void Promise.resolve(schemaPromise);
        }
    });

    return (
        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
                variant="outlined"
                onClick={updateCollectionSchema}
                disabled={schemaUpdating}
            >
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.cta.syncSchema" />
            </Button>
        </Box>
    );
}

export default UpdateSchemaButton;
