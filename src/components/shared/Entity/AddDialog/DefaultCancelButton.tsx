import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';

import { Button } from '@mui/material';

function DefaultCancelButton({ toggle }: AddCollectionDialogCTAProps) {
    return (
        <Button
            variant="outlined"
            onClick={() => {
                toggle(false);
            }}
        >
            Cancel
        </Button>
    );
}

export default DefaultCancelButton;
