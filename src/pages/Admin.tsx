import { Box, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';
import { Outlet } from 'react-router-dom';

const Admin: React.FC = () => {
    return (
        <PageContainer>
            <Typography>Admin</Typography>
            <Box>
                <Box
                    sx={{
                        marginLeft: 1.5,
                        height: 45,
                    }}
                >
                    <FormattedMessage id="admin.main.message" />
                    <Outlet />
                </Box>
            </Box>
        </PageContainer>
    );
};

export default Admin;
