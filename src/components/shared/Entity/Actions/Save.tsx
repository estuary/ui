import type { EntityCreateSaveButtonProps } from 'src/components/shared/Entity/Actions/types';

import { Button } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { useIntl } from 'react-intl';

import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'src/components/editor/Store/hooks';
import useSave from 'src/components/shared/Entity/Actions/useSave';
import { entityHeaderButtonSx } from 'src/context/Theme';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function EntityCreateSave({
    buttonLabelId,
    disabled,
    dryRun,
    loading,
    logEvent,
    onFailure,
}: EntityCreateSaveButtonProps) {
    const postHog = usePostHog();
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
                postHog.capture(
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
