import { Dialog, DialogContent } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import DialogTitleWithClose from 'components/shared/Dialog/TitleWithClose';
import TransformationCreate from 'components/transformation/create';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

const ARIA_LABEL_ID = 'derivation-create-dialog';
function DerivationCreate() {
    const navigate = useNavigate();

    // There is _probably_ a better way to do this, but the idea is
    // to reset the state of the NewCollection component every time
    // it's closed, so you don't reopen it and have your previous
    // selections still selected, which would be unexpected.
    const [newCollectionKey, setNewCollectionKey] = useState(0);

    const closeDialog = () => {
        navigate(authenticatedRoutes.collections.fullPath);
        setNewCollectionKey((k) => k + 1);
    };

    return (
        <Dialog
            open
            fullWidth
            maxWidth="lg"
            onClose={closeDialog}
            aria-labelledby={ARIA_LABEL_ID}
        >
            <DialogTitleWithClose id={ARIA_LABEL_ID} onClose={closeDialog}>
                <FormattedMessage id="newTransform.modal.title" />
            </DialogTitleWithClose>
            <DialogContent>
                <TransformationCreate key={newCollectionKey} />
            </DialogContent>
        </Dialog>
    );
}

export default DerivationCreate;
