import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useState } from 'react';

import {
    Collapse,
    Dialog,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import SingleLineCode from 'src/components/content/SingleLineCode';
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
    const [draftId, setDraftId] = useState<null | string>(null);

    const closeDialog = () => {
        navigate(authenticatedRoutes.collections.fullPath);
        setDraftId(null);
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
            maxWidth={showConfirmation ? 'md' : 'lg'}
            onClose={closeDialog}
            aria-labelledby={ARIA_LABEL_ID}
        >
            <DialogTitleWithClose id={ARIA_LABEL_ID} onClose={closeDialog}>
                <FormattedMessage id="newTransform.modal.title" />
            </DialogTitleWithClose>

            <DialogContent>
                <AdminCapabilityGuard>
                    <Collapse in={showConfirmation}>
                        <Stack spacing={2}>
                            <Typography>
                                Now that you’ve created a derivation draft, you
                                will need to continue development locally or in
                                a cloud environment. Follow these steps to edit
                                and publish your derivation.
                            </Typography>

                            <List component="ol">
                                <ListItem component="li">
                                    <ListItemText>
                                        Install Estuary’s flowctl CLI.
                                    </ListItemText>
                                </ListItem>

                                <ListItem component="li">
                                    <ListItemText>
                                        Authenticate your account with `flowctl
                                        auth login` and paste your access token
                                        into the terminal.
                                    </ListItemText>
                                </ListItem>

                                <ListItem component="li">
                                    <ListItemText>
                                        Pull your draft to continue working on
                                        your derivation specification:
                                    </ListItemText>
                                </ListItem>

                                <ListItem component="li">
                                    <ListItemText>
                                        <SingleLineCode
                                            value={`flowctl draft select --id ${draftId}`}
                                        />
                                    </ListItemText>
                                </ListItem>

                                <ListItem component="li">
                                    <ListItemText>
                                        <SingleLineCode value="flowctl draft develop" />
                                    </ListItemText>
                                </ListItem>

                                <ListItem component="li">
                                    <ListItemText>
                                        This will create a new file structure in
                                        your working directory. Edit the
                                        deepest-nested `flow.yaml` file and its
                                        associated SQL or TypeScript
                                        transformation files to describe your
                                        desired transformed collection. Learn
                                        more about constructing derivations.
                                    </ListItemText>
                                </ListItem>

                                <ListItem component="li">
                                    <ListItemText>
                                        When you’re done, you can save your
                                        draft specification back to Estuary
                                        using:
                                    </ListItemText>
                                </ListItem>

                                <ListItem component="li">
                                    <ListItemText>
                                        <SingleLineCode value="flowctl draft author --source flow.yaml" />
                                        <SingleLineCode value="flowctl draft publish" />
                                    </ListItemText>
                                </ListItem>
                            </List>
                        </Stack>
                    </Collapse>

                    <Collapse in={!showConfirmation}>
                        <BindingHydrator>
                            <TransformationCreate
                                key={newCollectionKey}
                                postWindowOpen={(draftId) => {
                                    if (draftId) {
                                        setDraftId(draftId);
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
