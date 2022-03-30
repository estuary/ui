import {
    Box,
    Toolbar,
    Typography,
    type SxProps,
    type Theme,
} from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import ConnectorsTable from 'components/tables/Connectors';
import { FormattedMessage } from 'react-intl';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Admin = () => {
    return (
        <PageContainer>
            <Toolbar>
                <Typography>
                    <FormattedMessage id="admin.header" />
                </Typography>
            </Toolbar>

            <Box sx={boxStyling}>
                <ConnectorsTable />
            </Box>
        </PageContainer>
    );
};

export default Admin;
