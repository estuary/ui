import { Box, Button } from '@mui/material';
import { getAuthRoles } from 'api/combinedGrantsExt';
import SharePrefixDialog from 'components/tables/AccessGrants/AccessLinks/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useEffectOnce } from 'react-use';

function AccessLinksButton() {
    const [open, setOpen] = useState<boolean>(false);
    const [objectRoles, setObjectRoles] = useState<string[]>([]);

    useEffectOnce(() => {
        getAuthRoles('admin').then(
            (response) => {
                if (response.data && response.data.length > 0) {
                    const roles = response.data.map(
                        ({ role_prefix }) => role_prefix
                    );

                    setObjectRoles(roles);
                }
            },
            () => {}
        );
    });

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
