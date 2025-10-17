import { useState } from 'react';

import { Box, Button } from '@mui/material';

import { useIntl } from 'react-intl';

import PrefixInvitationDialog from 'src/components/tables/AccessGrants/AccessLinks/Dialog';
import { useEntitiesStore_atLeastOneAdminTenant } from 'src/stores/Entities/hooks';

function AccessLinksButton() {
    const intl = useIntl();
    const [open, setOpen] = useState<boolean>(false);

    const atLeastOneAdminTenant = useEntitiesStore_atLeastOneAdminTenant();

    return atLeastOneAdminTenant ? (
        <Box>
            <Button
                variant="outlined"
                onClick={(event) => {
                    event.preventDefault();

                    setOpen(true);
                }}
                sx={{ whiteSpace: 'nowrap' }}
            >
                {intl.formatMessage({ id: 'admin.users.cta.prefixInvitation' })}
            </Button>

            <PrefixInvitationDialog open={open} setOpen={setOpen} />
        </Box>
    ) : null;
}

export default AccessLinksButton;
