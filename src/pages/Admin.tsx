import { Box, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';
import ConnectorsTable from '../tables/Connectors';

const Admin = () => {
    return (
        <PageContainer>
            <Toolbar>
                <Typography>
                    <FormattedMessage id="admin.header" />
                </Typography>
            </Toolbar>

            <Box
                sx={{
                    maxHeight: 250,
                    overflow: 'auto',
                }}
            >
                <ConnectorsTable />
            </Box>
        </PageContainer>
    );
};

export default Admin;
