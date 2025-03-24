import { Button } from '@mui/material';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { entityHeaderButtonSx } from 'context/Theme';

import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { EntityCreateSaveButtonProps } from './types';
import useSave from './useSave';

function EntityCreateSave({
    buttonLabelId,
    disabled,
    dryRun,
    loading,
    logEvent,
    onFailure,
}: EntityCreateSaveButtonProps) {
    const intl = useIntl();

    const save = useSave(logEvent, onFailure, dryRun);

    const isSaving = useEditorStore_isSaving();
    const draftId = useEditorStore_id();

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={disabled || isSaving || formActive}
            sx={entityHeaderButtonSx}
            onClick={async () => {
                await save(draftId);
            }}
        >
            {intl.formatMessage({
                id: buttonLabelId
                    ? buttonLabelId
                    : dryRun === true
                    ? `cta.testConfig${loading ? '.active' : ''}`
                    : `cta.saveEntity${loading ? '.active' : ''}`,
            })}
        </Button>
    );
}

export default EntityCreateSave;
