import { Divider, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import PageContainer from 'components/shared/PageContainer';
import StorageMappingsTable from 'components/tables/StorageMappings';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

function StorageMappings() {
    useBrowserTitle('browserTitle.admin.storageMappings');

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.admin.storageMappings.title,
                headerLink:
                    'https://docs.estuary.dev/concepts/storage-mappings/',
            }}
        >
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
        </PageContainer>
    );
}

export default StorageMappings;
