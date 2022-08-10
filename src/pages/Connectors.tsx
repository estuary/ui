import { Toolbar, Typography } from '@mui/material';
import ConnectorTile from 'components/ConnectorTile';
import PageContainer from 'components/shared/PageContainer';
// import ConnectorsTable from 'components/tables/Connectors';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

// const boxStyling: SxProps<Theme> = {
//     marginBottom: 2,
//     padding: 2,
// };

const Connectors = () => {
    useBrowserTitle('browserTitle.connectors');

    return (
        <PageContainer>
            <Toolbar>
                <Typography>
                    <FormattedMessage id="connectors.header" />
                </Typography>
            </Toolbar>

            <ConnectorTile cardWidth={250} cardsPerRow={4} gridSpacing={2} />
        </PageContainer>
    );
};

export default Connectors;
