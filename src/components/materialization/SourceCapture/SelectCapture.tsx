import { Button } from '@mui/material';
import AddDialog from 'components/shared/Entity/AddDialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import UpdateResourceConfigButton from './UpdateResourceConfigButton';

interface Props {
    enabled: boolean;
}

const DIALOG_ID = 'add-source-capture-search-dialog';

function SelectCapture({ enabled }: Props) {
    const formActive = useFormStateStore_isActive();

    const [open, setOpen] = useState<boolean>(false);

    const toggleDialog = (args: any) => {
        setOpen(typeof args === 'boolean' ? args : !open);
    };

    return (
        <>
            <Button disabled={formActive} onClick={toggleDialog}>
                <FormattedMessage
                    id={
                        enabled
                            ? 'workflows.sourceCapture.cta.edit'
                            : 'workflows.sourceCapture.cta'
                    }
                />
            </Button>
            <AddDialog
                entity="capture"
                id={DIALOG_ID}
                open={open}
                primaryCTA={UpdateResourceConfigButton}
                selectedCollections={[]}
                toggle={toggleDialog}
                title="Captures"
            />
        </>
    );
}

export default SelectCapture;
