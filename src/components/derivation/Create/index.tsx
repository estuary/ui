import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import NewCollection from 'components/collection/NewCollection';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

function DerivationCreate() {
    const navigate = useNavigate();

    // There is _probably_ a better way to do this, but the idea is
    // to reset the state of the NewCollection component every time
    // it's closed, so you don't reopen it and have your previous
    // selections still selected, which would be unexpected.
    const [newCollectionKey, setNewCollectionKey] = useState(0);

    return (
        <Dialog
            open
            fullWidth
            maxWidth="lg"
            onClose={() => {
                navigate(authenticatedRoutes.collections.fullPath);
                setNewCollectionKey((k) => k + 1);
            }}
        >
            <DialogTitle>
                <FormattedMessage id="newCollection.modal.title" />
            </DialogTitle>
            <DialogContent>
                <NewCollection key={newCollectionKey} />
            </DialogContent>
        </Dialog>
    );
}

export default DerivationCreate;
