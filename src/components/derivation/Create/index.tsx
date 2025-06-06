import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useState } from 'react';

import { Collapse, Dialog, DialogContent, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import AlertBox from 'src/components/shared/AlertBox';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import AdminCapabilityGuard from 'src/components/shared/guards/AdminCapability';
import TransformationCreate from 'src/components/transformation/create';
import { useZustandStore } from 'src/context/Zustand/provider';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { useBinding_resetState } from 'src/stores/Binding/hooks';
import BindingHydrator from 'src/stores/Binding/Hydrator';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { useTransformationCreate_resetState } from 'src/stores/TransformationCreate/hooks';

const ARIA_LABEL_ID = 'derivation-create-dialog';

function DerivationCreate() {
    const searchParams = new URLSearchParams(window.location.search);
    const collectionsPrefilled = searchParams.has(
        GlobalSearchParams.PREFILL_LIVE_SPEC_ID
    );

    const navigate = useNavigate();

    const resetBindingState = useBinding_resetState();
    const resetTransformationCreateState = useTransformationCreate_resetState();

    const resetTableSelections = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetSelected']
    >(
        SelectTableStoreNames.COLLECTION,
        selectableTableStoreSelectors.selected.reset
    );

    // There is _probably_ a better way to do this, but the idea is
    // to reset the state of the NewCollection component every time
    // it's closed, so you don't reopen it and have your previous
    // selections still selected, which would be unexpected.
    const [newCollectionKey, setNewCollectionKey] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const closeDialog = () => {
        navigate(authenticatedRoutes.collections.fullPath);
        setShowConfirmation(false);
        setNewCollectionKey((k) => k + 1);
        resetTransformationCreateState();
        resetBindingState(undefined, true);

        if (collectionsPrefilled) {
            resetTableSelections();
        }
    };

    return (
        <Dialog
            open
            fullWidth={!showConfirmation}
            maxWidth="lg"
            onClose={closeDialog}
            aria-labelledby={ARIA_LABEL_ID}
        >
            <DialogTitleWithClose id={ARIA_LABEL_ID} onClose={closeDialog}>
                <FormattedMessage id="newTransform.modal.title" />
            </DialogTitleWithClose>

            <DialogContent>
                <AdminCapabilityGuard>
                    <Collapse in={showConfirmation}>
                        <AlertBox
                            short
                            severity="info"
                            title={
                                <Typography>
                                    <FormattedMessage id="newTransform.info.gitPodWindowTitle" />
                                </Typography>
                            }
                        >
                            <FormattedMessage id="newTransform.info.gitPodWindowMessage" />
                        </AlertBox>
                    </Collapse>

                    <Collapse in={!showConfirmation}>
                        <BindingHydrator>
                            <TransformationCreate
                                key={newCollectionKey}
                                postWindowOpen={(gitPodWindow) => {
                                    // If there is a window object we know the browser at least let us open it up.
                                    //  This does not 100% prove that GitPod loaded correctly
                                    if (gitPodWindow) {
                                        setShowConfirmation(true);
                                    }
                                }}
                                closeDialog={closeDialog}
                            />
                        </BindingHydrator>
                    </Collapse>
                </AdminCapabilityGuard>
            </DialogContent>
        </Dialog>
    );
}

export default DerivationCreate;
