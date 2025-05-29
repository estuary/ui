import { useState } from 'react';

import { Box, Button } from '@mui/material';

import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import {
    useBindingsEditorStore_schemaUpdating,
    useBindingsEditorStore_updateSchema,
} from 'src/components/editor/Bindings/Store/hooks';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';

function UpdateSchemaButton() {
    const intl = useIntl();

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
        logRocketEvent(CustomEvents.COLLECTION_SCHEMA, { operation: 'sync' });

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
                {intl.formatMessage({
                    id: 'workflows.collectionSelector.schemaEdit.cta.syncSchema',
                })}
            </Button>
        </Box>
    );
}

export default UpdateSchemaButton;
