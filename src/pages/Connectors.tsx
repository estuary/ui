import { Toolbar, Typography } from '@mui/material';
import ConnectorTiles from 'components/ConnectorTiles';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const Connectors = () => {
    useBrowserTitle('browserTitle.connectors');

    return (
        <PageContainer>
            <Toolbar>
                <Typography>
                    <FormattedMessage id="connectors.header" />
                </Typography>
            </Toolbar>

            <ConnectorTiles cardWidth={250} cardsPerRow={4} gridSpacing={2} />
        </PageContainer>
    );
};

export default Connectors;
