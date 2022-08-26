import { ArrowForward } from '@mui/icons-material';
import {
    Autocomplete,
    AutocompleteInputChangeReason,
    Box,
    IconButton,
    InputBase,
    Paper,
    Typography,
} from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

const TITLE = 'browserTitle.error.pageNotFound';

const PageNotFound = () => {
    useBrowserTitle(TITLE);

    const intl = useIntl();
    const navigate = useNavigate();
    const [route, setRoute] = useState<string>('');

    const pages: { name: string; route: string }[] = [
        {
            name: intl.formatMessage({
                id: authenticatedRoutes.collections.title,
            }),
            route: authenticatedRoutes.collections.path,
        },
        {
            name: intl.formatMessage({
                id: authenticatedRoutes.captures.title,
            }),
            route: authenticatedRoutes.captures.path,
        },
        {
            name: intl.formatMessage({
                id: authenticatedRoutes.captures.create.title,
            }),
            route: authenticatedRoutes.captures.create.fullPath,
        },
        {
            name: intl.formatMessage({
                id: authenticatedRoutes.materializations.title,
            }),
            route: authenticatedRoutes.materializations.path,
        },
        {
            name: intl.formatMessage({
                id: authenticatedRoutes.materializations.create.title,
            }),
            route: authenticatedRoutes.materializations.create.path,
        },
        {
            name: intl.formatMessage({
                id: authenticatedRoutes.connectors.title,
            }),
            route: authenticatedRoutes.connectors.path,
        },
        {
            name: intl.formatMessage({ id: authenticatedRoutes.admin.title }),
            route: authenticatedRoutes.admin.path,
        },
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
        <PageContainer
            pageTitleProps={{
                header: TITLE,
            }}
        >
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                <FormattedMessage id="pageNotFound.heading" />
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 5,
                }}
            >
                {/* TODO (UI / UX) : Extend functionality and styling of custom search navigation bar. */}
                <Paper
                    variant="outlined"
                    sx={{
                        width: 394,
                        display: 'flex',
                        borderRadius: 5,
                    }}
                >
                    {/* TODO (errors) : Update and add error handling to the autocomplete functionality. */}
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
