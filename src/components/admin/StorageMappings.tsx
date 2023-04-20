import { Divider, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import StorageMappingsTable from 'components/tables/StorageMappings';
import usePageTitle from 'hooks/usePageTitle';
import { FormattedMessage } from 'react-intl';

function StorageMappings() {
    usePageTitle({
        header: authenticatedRoutes.admin.storageMappings.title,
        headerLink: 'https://docs.estuary.dev/concepts/storage-mappings/',
    });

    return (
        <>
            <AdminTabs />
            <Stack direction="column" spacing={2} sx={{ m: 2 }}>
                <Typography
                    component="span"
                    variant="h6"
                    sx={{
                        alignItems: 'center',
                    }}
                >
                    <FormattedMessage id="storageMappings.header" />
                </Typography>
                <Typography>
                    <FormattedMessage id="storageMappings.message" />
                </Typography>
                <Divider />
            </Stack>
            <StorageMappingsTable />
        </>
    );
}

export default StorageMappings;
