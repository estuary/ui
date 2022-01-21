import { Box, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';

const Home: React.FC = () => {
    return (
        <PageContainer>
            <Toolbar
                sx={{
                    justifyContent: 'center',
                }}
            >
                <Typography variant="h3">Welcome!</Typography>
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
                    Click the Capture link over on the side navigation to get
                    started.
                </Typography>
            </Box>
        </PageContainer>
    );
};

export default Home;
