import type { EntityCreateSaveButtonProps } from 'src/components/shared/Entity/Actions/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import PreSaveConfirmation from 'src/components/editor/Bindings/Backfill/PreSaveConfirmation';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'src/components/editor/Store/hooks';
import useSave from 'src/components/shared/Entity/Actions/useSave';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import { entityHeaderButtonSx } from 'src/context/Theme';
import { logRocketEvent } from 'src/services/shared';
import { useBinding_collectionsBeingBackfilled } from 'src/stores/Binding/hooks';
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

    const confirmationModalContext = useConfirmationModalContext();
    const collectionsBeingBackfilled = useBinding_collectionsBeingBackfilled();

    const isSaving = useEditorStore_isSaving();
    const draftId = useEditorStore_id();

    const formActive = useFormStateStore_isActive();

    return (
        <Button
            disabled={disabled || isSaving || formActive}
            sx={entityHeaderButtonSx}
            onClick={() => {
                if (!dryRun && collectionsBeingBackfilled.length > 0) {
                    confirmationModalContext
                        ?.showConfirmation({
                            dialogProps: {
                                maxWidth: 'sm',
                            },
                            message: <PreSaveConfirmation />,
                        })
                        .then(async (confirmed: any) => {
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
