import { Box, Button } from '@mui/material';
import ShareDataDialog from 'components/tables/AccessGrants/DataSharing/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';

function DataShareButton() {
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
                <FormattedMessage id="admin.prefix.cta.issueGrant" />
            </Button>

            <ShareDataDialog open={open} setOpen={setOpen} />
        </Box>
    ) : null;
}

export default DataShareButton;
