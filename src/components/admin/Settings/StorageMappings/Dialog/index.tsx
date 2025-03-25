import { Dialog } from '@mui/material';
import StorageMappingActions from 'components/admin/Settings/StorageMappings/Dialog/Actions';
import StorageMappingContent from 'components/admin/Settings/StorageMappings/Dialog/Content';
import StorageMappingTitle from 'components/admin/Settings/StorageMappings/Dialog/Title';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import type { Dispatch, SetStateAction } from 'react';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'configure-storage-dialog-title';

function ConfigureStorageDialog({ open, setOpen }: Props) {
    const resetState = useStorageMappingStore((state) => state.resetState);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(false);
        resetState();
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
            <StorageMappingTitle closeDialog={closeDialog} />

            <StorageMappingContent />

            <StorageMappingActions closeDialog={closeDialog} />
        </Dialog>
    );
}

export default ConfigureStorageDialog;
