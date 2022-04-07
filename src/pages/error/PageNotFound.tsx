import { ArrowForward } from '@mui/icons-material';
import {
    Autocomplete,
    AutocompleteInputChangeReason,
    Box,
    IconButton,
    InputBase,
    Link,
    Paper,
    Typography,
} from '@mui/material';
import Topbar from 'components/header/Topbar';
import PageContainer from 'components/shared/PageContainer';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
    const navigate = useNavigate();

    const [route, setRoute] = useState<string>('');

    const pages: { name: string; route: string }[] = [
        { name: 'Dashboard', route: '/' },
        { name: 'Captures', route: '/captures' },
        { name: 'Materializations', route: '/materializations' },
        { name: 'Admin', route: '/admin' },
    ];

    const handlers = {
        routeSelected: (
            event: React.SyntheticEvent,
            value: string,
            reason: AutocompleteInputChangeReason
        ) => {
            if (reason === 'reset') {
                const selectedRoute =
                    pages.find(({ name }) => name === value)?.route ?? '/';

                setRoute(selectedRoute);
            }
        },
        requestNavigation: () => {
            navigate(route);
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
                        width: 394,
                        display: 'flex',
                        borderRadius: 5,
                    }}
                >
                    {/* TODO: Update and add error handling to the autocomplete functionality. */}
                    <Autocomplete
                        options={pages.map((page) => page.name)}
                        fullWidth
                        onInputChange={handlers.routeSelected}
                        renderInput={(params) => {
                            const { InputLabelProps, InputProps, ...rest } =
                                params;

                            return (
                                <InputBase
                                    {...InputProps}
                                    {...rest}
                                    placeholder="Search Navigation Menu"
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
                            );
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

export default PageNotFound;
