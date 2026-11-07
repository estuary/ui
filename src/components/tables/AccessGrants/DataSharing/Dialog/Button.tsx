import { useState } from 'react';

import { Box, Button } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import ShareDataDialog from 'src/components/tables/AccessGrants/DataSharing/Dialog';
import { useEntitiesStore_atLeastOneAdminTenant } from 'src/stores/Entities/hooks';

function DataShareButton() {
    const { ref: semanticShareDataRef } =
        useSemanticLeaf<HTMLButtonElement>('Share Data');

    const [open, setOpen] = useState<boolean>(false);

    const atLeastOneAdminTenant = useEntitiesStore_atLeastOneAdminTenant();

    return atLeastOneAdminTenant ? (
        <Box>
            <Button
                ref={semanticShareDataRef}
                variant="outlined"
                onClick={(event) => {
                    event.preventDefault();

                    setOpen(true);
                }}
                sx={{ whiteSpace: 'nowrap' }}
            >
                Grant Access
            </Button>

            <ShareDataDialog open={open} setOpen={setOpen} />
        </Box>
    ) : null;
}

export default DataShareButton;
