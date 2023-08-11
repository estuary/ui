import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_setEditModeEnabled,
} from '../Store/hooks';

function SchemaEditToggle() {
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();
    const setEditModeEnabled = useBindingsEditorStore_setEditModeEnabled();

    const toggleEditMode = () => {
        setEditModeEnabled(!editModeEnabled);
    };

    return (
        <Button onClick={toggleEditMode}>
            <FormattedMessage id={editModeEnabled ? 'cta.close' : 'cta.edit'} />
        </Button>
    );
}

export default SchemaEditToggle;
