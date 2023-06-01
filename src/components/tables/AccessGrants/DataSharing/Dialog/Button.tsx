import { Box, Button } from '@mui/material';
import ShareDataDialog from 'components/tables/AccessGrants/DataSharing/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';

function DataShareButton() {
    const [open, setOpen] = useState<boolean>(false);

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);

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
                <FormattedMessage id="admin.prefix.cta.issueGrant" />
            </Button>

            <ShareDataDialog
                objectRoles={objectRoles}
                open={open}
                setOpen={setOpen}
            />
        </Box>
    ) : null;
}

export default DataShareButton;
