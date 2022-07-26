import {
    Box,
    Toolbar,
    Typography,
    type SxProps,
    type Theme,
} from '@mui/material';
import GridWrapper from 'components/layout/GridWrapper';
import PageContainer from 'components/shared/PageContainer';
import ConnectorsTable from 'components/tables/Connectors';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Connectors = () => {
    useBrowserTitle('browserTitle.connectors');

    return (
        <PageContainer>
            <Toolbar>
                <Typography>
                    <FormattedMessage id="connectors.header" />
                </Typography>
            </Toolbar>

            <Box sx={boxStyling}>
                <ConnectorsTable />
            </Box>

            <GridWrapper />
        </PageContainer>
    );
};

export default Connectors;
