import { useState } from 'react';

import { Box, Button } from '@mui/material';

import { useLeaf } from 'react-semantic-tree';

import ShareDataDialog from 'src/components/tables/AccessGrants/DataSharing/Dialog';
import { useEntitiesStore_atLeastOneAdminTenant } from 'src/stores/Entities/hooks';

function DataShareButton() {
    const { ref } = useLeaf('Grant Access');

    const [open, setOpen] = useState<boolean>(false);

    const atLeastOneAdminTenant = useEntitiesStore_atLeastOneAdminTenant();

    return atLeastOneAdminTenant ? (
        <Box>
            <Button
                ref={ref}
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
