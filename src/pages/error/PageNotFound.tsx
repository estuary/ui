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
import PageContainer from 'components/shared/PageContainer';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useTitle } from 'react-use';

const PageNotFound = () => {
    const intl = useIntl();
    useTitle(
        intl.formatMessage({
            id: 'browserTitle.error.pageNotFound',
        })
    );

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
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                <FormattedMessage id="pageNotFound.heading" />
            </Typography>

            {/* TODO: Consider adjusting the focus-visible state of the dashboard link. */}
            <Typography align="center" sx={{ mb: 7 }}>
                <FormattedMessage
                    id="pageNotFound.message"
                    values={{
                        dashboard: (
                            <Link href="/" underline="none">
                                dashboard
                            </Link>
                        ),
                    }}
                />
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
                                    placeholder="Search Navigation Options"
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
