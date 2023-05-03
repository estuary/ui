import { Box, Button } from '@mui/material';
import SharePrefixDialog from 'components/tables/AccessGrants/AccessLinks/Dialog';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

function AccessLinksButton() {
    const [open, setOpen] = useState<boolean>(false);

    const { combinedGrants } = useCombinedGrantsExt({ adminOnly: true });

    return combinedGrants.length > 0 ? (
        <Box>
            <Button
                variant="outlined"
                onClick={() => setOpen(true)}
                sx={{ whiteSpace: 'nowrap' }}
            >
                <FormattedMessage id="admin.users.cta.sharePrefix" />
            </Button>

            <SharePrefixDialog
                tenants={combinedGrants.map(({ object_role }) => object_role)}
                open={open}
                setOpen={setOpen}
            />
        </Box>
    ) : null;
}

export default AccessLinksButton;
