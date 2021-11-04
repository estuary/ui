import { Box, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { Outlet } from 'react-router-dom';

export default function Admin() {
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
                    This will most likely be a smaller "sub app" where you can
                    view logs, alerts, users, etc.
                    <Outlet />
                </Box>
            </Box>
        </PageContainer>
    );
}
