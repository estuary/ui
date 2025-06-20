import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_setEditModeEnabled,
} from 'src/components/editor/Bindings/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSchemaEvolution_autoDiscover } from 'src/stores/SchemaEvolution/hooks';

function SchemaEditToggle() {
    const intl = useIntl();
    const entityType = useEntityType();
    const autoDiscover = useSchemaEvolution_autoDiscover();
    const formActive = useFormStateStore_isActive();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();
    const setEditModeEnabled = useBindingsEditorStore_setEditModeEnabled();

    const toggleEditMode = () => {
        logRocketEvent(CustomEvents.COLLECTION_SCHEMA, {
            operation: 'edit',
            enabled: !editModeEnabled,
        });

        setEditModeEnabled(!editModeEnabled);
    };

    return (
        <Button
            onClick={toggleEditMode}
            disabled={formActive || (autoDiscover && entityType === 'capture')}
        >
            {intl.formatMessage({
                id: editModeEnabled ? 'cta.close' : 'cta.edit',
            })}
        </Button>
    );
}

export default SchemaEditToggle;
