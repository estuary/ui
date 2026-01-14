import type { EntityCreateSaveButtonProps } from 'src/components/shared/Entity/Actions/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'src/components/editor/Store/hooks';
import useSave from 'src/components/shared/Entity/Actions/useSave';
import { entityHeaderButtonSx } from 'src/context/Theme';
import { fireGtmEvent } from 'src/services/gtm';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

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

    const isDryRun = dryRun === true;

    return (
        <Button
            disabled={disabled || isSaving || formActive}
            sx={entityHeaderButtonSx}
            onClick={() => {
                void save(draftId);
                fireGtmEvent(
                    isDryRun ? 'test_click' : 'save_and_publish_click'
                );
            }}
        >
            {intl.formatMessage({
                id: buttonLabelId
                    ? buttonLabelId
                    : isDryRun
                      ? `cta.testConfig${loading ? '.active' : ''}`
                      : `cta.saveEntity${loading ? '.active' : ''}`,
            })}
        </Button>
    );
}

export default EntityCreateSave;
