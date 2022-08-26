import { Stack, Toolbar, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import ConnectorTiles from 'components/ConnectorTiles';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const Connectors = () => {
    useBrowserTitle('browserTitle.connectors');

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.connectors.title,
                headerLink: 'https://docs.estuary.dev/concepts/#connectors',
            }}
        >
            <Toolbar>
                <Stack direction="row" spacing={1}>
                    <Typography variant="h6" align="center">
                        <FormattedMessage id="connectorTable.title" />
                    </Typography>
                </Stack>
            </Toolbar>

            <ConnectorTiles cardWidth={250} cardsPerRow={4} gridSpacing={2} />
        </PageContainer>
    );
};

export default Connectors;
