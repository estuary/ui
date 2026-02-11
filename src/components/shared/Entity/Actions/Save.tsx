import type { EntityCreateSaveButtonProps } from 'src/components/shared/Entity/Actions/types';

import { Button } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { useIntl } from 'react-intl';

import { PreSaveConfirmation } from 'src/components/editor/Bindings/Backfill/PreSaveConfirmation';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'src/components/editor/Store/hooks';
import useSave from 'src/components/shared/Entity/Actions/useSave';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import { entityHeaderButtonSx } from 'src/context/Theme';
import { useEntityWorkflow } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { useBinding_collectionsBeingBackfilled } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { LocalStorageKeys } from 'src/utils/localStorage-utils';

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

    const entityWorkFlow = useEntityWorkflow();

    const save = useSave(logEvent, onFailure, dryRun);

    const confirmationModalContext = useConfirmationModalContext();
    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();
    const backfillMode = useBindingStore((state) => state.backfillMode);

    const isSaving = useEditorStore_isSaving();
    const draftId = useEditorStore_id();

    const formActive = useFormStateStore_isActive();

    const isDryRun = dryRun === true;

    return (
        <Button
            disabled={disabled || isSaving || formActive}
            sx={entityHeaderButtonSx}
            onClick={() => {
                if (
                    !dryRun &&
                    entityWorkFlow === 'capture_edit' &&
                    backfillMode === 'reset' &&
                    collectionsBeingBackfilled.length > 0
                ) {
                    confirmationModalContext
                        ?.showConfirmation({
                            dialogProps: {
                                maxWidth: 'sm',
                                sx: { minWidth: 375 },
                            },
                            doNotShowAgainStorageKey:
                                LocalStorageKeys.CONFIRMATION_DISMISS_DATAFLOW_RESET,
                            message: <PreSaveConfirmation />,
                        })
                        .then((confirmed: true) => {
                            if (confirmed) {
                                void save(draftId);
                            }

                            logRocketEvent('Data_Flow_Reset', {
                                confirmationAccepted: confirmed,
                            });
                        })
                        .catch(() => {
                            logRocketEvent('Data_Flow_Reset', {
                                confirmationException: true,
                            });
                        });
                } else {
                    void save(draftId);
                }

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
