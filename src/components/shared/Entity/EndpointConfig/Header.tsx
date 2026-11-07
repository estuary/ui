import { Divider, Typography, useMediaQuery, useTheme } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { WarningCircle } from 'iconoir-react';

import ExternalLink from 'src/components/shared/ExternalLink';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import { useSidePanelDocsStore } from 'src/stores/SidePanelDocs/Store';

function EndpointConfigHeader() {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const [endpointConfigErrorsExist, hydrationErrorsExist] =
        useEndpointConfigStore(
            useShallow((state) => [
                state.errorsExist,
                state.hydrationErrorsExist,
            ])
        );
    const docsURL = useSidePanelDocsStore((state) => state.url);

    return (
        <>
            {endpointConfigErrorsExist || hydrationErrorsExist ? (
                <WarningCircle
                    style={{
                        marginRight: 8,
                        fontSize: 12,
                        color: theme.palette.error.main,
                    }}
                />
            ) : null}

            <Typography component="span" variant="subtitle1">
                2. Endpoint Config
            </Typography>

            {belowMd && docsURL && docsURL.length > 0 ? (
                <>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <ExternalLink link={docsURL}>Connector Help</ExternalLink>
                </>
            ) : null}
        </>
    );
}

export default EndpointConfigHeader;
