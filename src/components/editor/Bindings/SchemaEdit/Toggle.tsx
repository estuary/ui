import { Button } from '@mui/material';
import useInitializeCollectionDraft from 'hooks/useInitializeCollectionDraft';
import { FormattedMessage } from 'react-intl';
import { useBinding_currentCollection } from 'stores/Binding/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_setEditModeEnabled,
} from '../Store/hooks';

function SchemaEditToggle() {
    const { addCollectionToDraft } = useInitializeCollectionDraft();

    const formActive = useFormStateStore_isActive();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();
    const setEditModeEnabled = useBindingsEditorStore_setEditModeEnabled();
    const currentCollection = useBinding_currentCollection();

    const toggleEditMode = async () => {
        if (currentCollection) {
            await addCollectionToDraft(currentCollection);
        }
        setEditModeEnabled(!editModeEnabled);
    };

    return (
        <Button onClick={toggleEditMode} disabled={formActive}>
            <FormattedMessage id={editModeEnabled ? 'cta.close' : 'cta.edit'} />
        </Button>
    );
}

export default SchemaEditToggle;
