import { Box, Button } from '@mui/material';
import PrefixInvitationDialog from 'components/tables/AccessGrants/AccessLinks/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEntitiesStore_atLeastOneAdminTenant } from 'stores/Entities/hooks';

function AccessLinksButton() {
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
                <FormattedMessage id="admin.users.cta.prefixInvitation" />
            </Button>

            <PrefixInvitationDialog open={open} setOpen={setOpen} />
        </Box>
    ) : null;
}

export default AccessLinksButton;
