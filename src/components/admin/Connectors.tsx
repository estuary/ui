import { Stack, Toolbar, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { authenticatedRoutes } from 'src/app/routes';
import AdminTabs from 'src/components/admin/Tabs';
import ConnectorGrid from 'src/components/connectors/Grid';
import usePageTitle from 'src/hooks/usePageTitle';

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
