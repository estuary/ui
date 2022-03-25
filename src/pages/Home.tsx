import { Box, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';

const Home = () => {
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
        </PageContainer>
    );
};

export default Home;
