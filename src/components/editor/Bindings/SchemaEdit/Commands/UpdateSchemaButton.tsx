import { Box, Button } from '@mui/material';
import { useBindingsEditorStore_updateSchema } from 'components/editor/Bindings/Store/hooks';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

function UpdateSchemaButton() {
    // Bindings Editor Store
    const updateSchema = useBindingsEditorStore_updateSchema();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const updateCollectionSchema = () => {
        updateSchema(currentCollection, persistedDraftId);
    };

    return (
        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={updateCollectionSchema}>
                <FormattedMessage id="workflows.collectionSelector.schemaEdit.cta.syncSchema" />
            </Button>
        </Box>
    );
}

export default UpdateSchemaButton;
