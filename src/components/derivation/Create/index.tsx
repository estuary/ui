import { Collapse, Dialog, DialogContent, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AlertBox from 'components/shared/AlertBox';
import DialogTitleWithClose from 'components/shared/Dialog/TitleWithClose';
import AdminCapabilityGuard from 'components/shared/guards/AdminCapability';
import TransformationCreate from 'components/transformation/create';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useBinding_resetState } from 'stores/Binding/hooks';
import { useTransformationCreate_resetState } from 'stores/TransformationCreate/hooks';

const ARIA_LABEL_ID = 'derivation-create-dialog';

function DerivationCreate() {
    const navigate = useNavigate();

    const resetBindingState = useBinding_resetState();
    const resetTransformationCreateState = useTransformationCreate_resetState();

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
                    </Collapse>
                </AdminCapabilityGuard>
            </DialogContent>
        </Dialog>
    );
}

export default DerivationCreate;
