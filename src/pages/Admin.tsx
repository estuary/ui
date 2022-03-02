import {
    Box,
    Toolbar,
    Typography,
    type SxProps,
    type Theme,
} from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';
import AccountsTable from '../components/tables/Accounts';
import ConnectorsTable from '../components/tables/Connectors';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    overflow: 'hidden',
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
                <ConnectorsTable height={250} />
            </Box>

            <Box sx={boxStyling}>
                <AccountsTable height={250} />
            </Box>
        </PageContainer>
    );
};

export default Admin;
