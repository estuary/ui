import { Box, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';
import AccountsTable from '../tables/Accounts';
import ConnectorsTable from '../tables/Connectors';

const boxStyling = {
    marginBottom: 2,
    overflow: 'hidden',
    width: '100%',
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

            <AccountsTable />
        </PageContainer>
    );
};

export default Admin;
