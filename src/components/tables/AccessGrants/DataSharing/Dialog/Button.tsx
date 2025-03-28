import { Box, Button } from '@mui/material';
import ShareDataDialog from 'src/components/tables/AccessGrants/DataSharing/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEntitiesStore_atLeastOneAdminTenant } from 'src/stores/Entities/hooks';

function DataShareButton() {
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
                <FormattedMessage id="admin.prefix.cta.issueGrant" />
            </Button>

            <ShareDataDialog open={open} setOpen={setOpen} />
        </Box>
    ) : null;
}

export default DataShareButton;
