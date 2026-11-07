import { useState } from 'react';

import { Box, Button } from '@mui/material';

import PrefixInvitationDialog from 'src/components/tables/AccessGrants/AccessLinks/Dialog';
import { useEntitiesStore_atLeastOneAdminTenant } from 'src/stores/Entities/hooks';

function AccessLinksButton() {
    const [open, setOpen] = useState<boolean>(false);

    const atLeastOneAdminTenant = useEntitiesStore_atLeastOneAdminTenant();

    if (atLeastOneAdminTenant) {
        return (
            <Box>
                <Button
                    variant="outlined"
                    onClick={(event) => {
                        event.preventDefault();

                        setOpen(true);
                    }}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Add Users
                </Button>

                <PrefixInvitationDialog open={open} setOpen={setOpen} />
            </Box>
        );
    }

    return null;
}

export default AccessLinksButton;
