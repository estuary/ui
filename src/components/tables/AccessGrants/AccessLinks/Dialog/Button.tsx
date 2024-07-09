import { Box, Button } from '@mui/material';
import PrefixInvitationDialog from 'components/tables/AccessGrants/AccessLinks/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';

function AccessLinksButton() {
    const [open, setOpen] = useState<boolean>(false);

    const objectRoles = useEntitiesStore_capabilities_adminable();

    return objectRoles.length > 0 ? (
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
