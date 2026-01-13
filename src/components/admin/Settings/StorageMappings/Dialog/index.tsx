import type { Dispatch, SetStateAction } from 'react';

import { Dialog } from '@mui/material';

// import StorageMappingActions from 'src/components/admin/Settings/StorageMappings/Dialog/Actions';
import StorageMappingContent from 'src/components/admin/Settings/StorageMappings/Dialog/Content';
import StorageMappingTitle from 'src/components/admin/Settings/StorageMappings/Dialog/Title';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';

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
        <Dialog open={open} maxWidth="sm" fullWidth aria-labelledby={TITLE_ID}>
            <StorageMappingTitle closeDialog={closeDialog} />

            <StorageMappingContent />
            {/* commented out to prevent spamming network errors in the console during development */}
            {/* <StorageMappingActions closeDialog={closeDialog} /> */}
        </Dialog>
    );
}

export default ConfigureStorageDialog;
