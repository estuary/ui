import type { EntityCreateSaveButtonProps } from 'src/components/shared/Entity/Actions/types';

import { useRef } from 'react';

import { Button } from '@mui/material';

import { debounce } from 'lodash';
import { useIntl } from 'react-intl';

import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'src/components/editor/Store/hooks';
import useSave from 'src/components/shared/Entity/Actions/useSave';
import { entityHeaderButtonSx } from 'src/context/Theme';
import {
    useFormStateStore_isActive,
    useFormStateStore_updateStatus,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { LONG_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

function EntityCreateSave({
    buttonLabelId,
    disabled,
    dryRun,
    loading,
    logEvent,
    onFailure,
}: EntityCreateSaveButtonProps) {
    console.log('EntityCreateSave', { disabled, loading });
    const intl = useIntl();

    const save = useSave(logEvent, onFailure, dryRun);

    const isSaving = useEditorStore_isSaving();
    const draftId = useEditorStore_id();

    const formActive = useFormStateStore_isActive();
    const updateStatus = useFormStateStore_updateStatus();

    const debouncedSave = useRef(
        debounce((savingDraft: any) => {
            console.log('debounced save', savingDraft);
            void save(savingDraft);
        }, LONG_DEBOUNCE_WAIT)
    );

    return (
        <Button
            disabled={disabled || isSaving || formActive}
            sx={entityHeaderButtonSx}
            onClick={() => {
                updateStatus(FormStatus.PROCESSING);
                debouncedSave.current(draftId);
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
