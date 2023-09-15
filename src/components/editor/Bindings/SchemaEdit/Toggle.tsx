import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_setEditModeEnabled,
} from '../Store/hooks';

function SchemaEditToggle() {
    const formActive = useFormStateStore_isActive();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();
    const setEditModeEnabled = useBindingsEditorStore_setEditModeEnabled();

    const toggleEditMode = () => {
        setEditModeEnabled(!editModeEnabled);
    };

    return (
        <Button onClick={toggleEditMode} disabled={formActive}>
            <FormattedMessage id={editModeEnabled ? 'cta.close' : 'cta.edit'} />
        </Button>
    );
}

export default SchemaEditToggle;
