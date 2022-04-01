import { ArrowForward } from '@mui/icons-material';
import {
    Box,
    IconButton,
    InputBase,
    Link,
    Paper,
    Typography,
} from '@mui/material';
import Topbar from 'components/header/Topbar';
import PageContainer from 'components/shared/PageContainer';
import { useNavigate } from 'react-router-dom';

const Error = () => {
    const navigate = useNavigate();

    const handlers = {
        requestNavigation: () => {
            navigate('/');
        },
    };

    return (
        <PageContainer>
            <Topbar isNavigationOpen={false} hideNavigationMenu />
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                Sorry, that page cannot be found.
            </Typography>

            {/* TODO: Consider adjusting the focus-visible state of the dashboard link. */}
            <Typography align="center" sx={{ mb: 7 }}>
                Try searching for a page below or go directly to your{' '}
                <Link href="/" underline="none">
                    dashboard
                </Link>
                .
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 5,
                }}
            >
                {/* TODO: Extend functionality and styling of custom search navigation bar. */}
                <Paper
                    variant="outlined"
                    sx={{
                        'width': 394,
                        'display': 'flex',
                        'borderRadius': 5,
                        '&:focus': {
                            outlineWidth: 2,
                            outlineColor: '#000000',
                            outlineStyle: 'solid',
                        },
                    }}
                >
                    {/* TODO: Add autocomplete functionality to the custom search navigation bar. */}
                    <InputBase
                        placeholder="Search Navigation Menu"
                        size="medium"
                        fullWidth
                        sx={{
                            '.MuiInputBase-input': {
                                'px': 1.75,
                                'py': 1.0625,
                                '&:focus-visible, &:hover': {
                                    color: '#5660BD',
                                },
                            },
                        }}
                    />

                    <IconButton
                        onClick={handlers.requestNavigation}
                        sx={{
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 9,
                            borderBottomRightRadius: 9,
                            borderBottomLeftRadius: 0,
                        }}
                    >
                        <ArrowForward />
                    </IconButton>
                </Paper>
            </Box>
        </PageContainer>
    );
};

export default Error;
