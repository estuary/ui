import { Box, SxProps, Theme, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import DashboardTable from 'components/tables/Dashboard';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Dashboard = () => {
    useBrowserTitle('browserTitle.dashboard');

    return (
        <PageContainer>
            <Toolbar
                sx={{
                    justifyContent: 'center',
                }}
            >
                <Typography variant="h3">
                    <FormattedMessage id="home.main.header" />
                </Typography>
            </Toolbar>
            <Box
                sx={{
                    display: 'flex',
                    height: 150,
                    justifyContent: 'center',
                    mt: 2,
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="home.main.description" />
                </Typography>
            </Box>
            <Box sx={boxStyling}>
                <DashboardTable />
            </Box>
        </PageContainer>
    );
};

export default Dashboard;
