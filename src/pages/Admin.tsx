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

            {/* <Box sx={boxStyling}>
                <ConnectorsTable />
            </Box> */}

            <Box sx={boxStyling}>
                <AccountsTable />
            </Box>
        </PageContainer>
    );
};

export default Admin;
