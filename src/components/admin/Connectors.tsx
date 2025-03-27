import { Stack, Toolbar, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import ConnectorGrid from 'components/connectors/Grid';
import usePageTitle from 'hooks/usePageTitle';
import { FormattedMessage } from 'react-intl';

const AdminConnectors = () => {
    usePageTitle({
        header: authenticatedRoutes.admin.connectors.title,
        headerLink: 'https://docs.estuary.dev/concepts/connectors/',
    });

    return (
        <>
            <AdminTabs />
            <Toolbar>
                <Stack direction="row" spacing={1}>
                    <Typography variant="h6" align="center">
                        <FormattedMessage id="connectorTable.title" />
                    </Typography>
                </Stack>
            </Toolbar>

            <ConnectorGrid />
        </>
    );
};

export default AdminConnectors;
