import { useCallback } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import {
    useBindingsEditorStore_editModeEnabled,
    useBindingsEditorStore_setEditModeEnabled,
} from 'src/components/editor/Bindings/Store/hooks';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function SchemaEditToggle() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();
    const setEditModeEnabled = useBindingsEditorStore_setEditModeEnabled();

    const toggleEditMode = useCallback(
        (forced?: boolean) => {
            logRocketEvent(CustomEvents.COLLECTION_SCHEMA, {
                operation: 'edit',
                enabled: !editModeEnabled,
            });

            setEditModeEnabled(forced ?? !editModeEnabled);
        },
        [editModeEnabled, setEditModeEnabled]
    );

    return (
        <Button
            onClick={() => {
                toggleEditMode();
            }}
            disabled={formActive}
        >
            {intl.formatMessage({
                id: editModeEnabled ? 'cta.close' : 'cta.edit',
            })}
        </Button>
    );
}

export default SchemaEditToggle;
