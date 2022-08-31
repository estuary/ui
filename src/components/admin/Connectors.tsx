import { Stack, Toolbar, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import AdminTabs from 'components/admin/Tabs';
import ConnectorTiles from 'components/ConnectorTiles';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const AdminConnectors = () => {
    useBrowserTitle('browserTitle.admin.connectors');

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.admin.connectors.title,
                headerLink: 'https://docs.estuary.dev/concepts/connectors/',
            }}
        >
            <AdminTabs />
            <Toolbar>
                <Stack direction="row" spacing={1}>
                    <Typography variant="h6" align="center">
                        <FormattedMessage id="connectorTable.title" />
                    </Typography>
                </Stack>
            </Toolbar>

            <ConnectorTiles />
        </PageContainer>
    );
};

export default AdminConnectors;
