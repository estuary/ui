import { Button } from '@mui/material';
import AddDialog from 'components/shared/Entity/AddDialog';
import invariableStores from 'context/Zustand/invariableStores';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useStore } from 'zustand';
import AddSourceCaptureToSpecButton from './AddSourceCaptureToSpecButton';

const DIALOG_ID = 'add-source-capture-search-dialog';

function SelectCapture() {
    const formActive = useFormStateStore_isActive();

    const sourceCapture = useStore(
        invariableStores['source-capture'],
        (state) => state.sourceCapture
    );

    const [open, setOpen] = useState<boolean>(false);

    const toggleDialog = (args: any) => {
        setOpen(typeof args === 'boolean' ? args : !open);
    };

    return (
        <>
            <Button disabled={formActive} onClick={toggleDialog}>
                <FormattedMessage
                    id={
                        sourceCapture
                            ? 'workflows.sourceCapture.cta.edit'
                            : 'workflows.sourceCapture.cta'
                    }
                />
            </Button>
            <AddDialog
                entity="capture"
                id={DIALOG_ID}
                open={open}
                primaryCTA={AddSourceCaptureToSpecButton}
                selectedCollections={sourceCapture ? [sourceCapture] : []}
                toggle={toggleDialog}
                title={<FormattedMessage id="captureTable.header" />}
            />
        </>
    );
}

export default SelectCapture;
