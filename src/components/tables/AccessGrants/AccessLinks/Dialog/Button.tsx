import { Box, Button } from '@mui/material';
import SharePrefixDialog from 'components/tables/AccessGrants/AccessLinks/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEntitiesStore_prefixes_admin } from 'stores/Entities/hooks';

function AccessLinksButton() {
    const [open, setOpen] = useState<boolean>(false);

    const adminPrefixes = useEntitiesStore_prefixes_admin();
    const objectRoles = Object.keys(adminPrefixes);

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
                <FormattedMessage id="admin.users.cta.sharePrefix" />
            </Button>

            <SharePrefixDialog
                objectRoles={objectRoles}
                open={open}
                setOpen={setOpen}
            />
        </Box>
    ) : null;
}

export default AccessLinksButton;
