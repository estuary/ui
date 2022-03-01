import { Box, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';
import AccountsTable from '../tables/Accounts';
import ConnectorsTable from '../tables/Connectors';

const boxStyling = {
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
