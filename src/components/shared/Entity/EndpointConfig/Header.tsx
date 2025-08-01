import { Divider, Typography, useMediaQuery, useTheme } from '@mui/material';

import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';
import { useEndpointConfigStore_errorsExist } from 'src/stores/EndpointConfig/hooks';
import { useSidePanelDocsStore } from 'src/stores/SidePanelDocs/Store';

function EndpointConfigHeader() {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    const docsURL = useSidePanelDocsStore((state) => state.url);

    return (
        <>
            {endpointConfigErrorsExist ? (
                <WarningCircle
                    style={{
                        marginRight: 8,
                        fontSize: 12,
                        color: theme.palette.error.main,
                    }}
                />
            ) : null}

            <Typography variant="subtitle1">
                <FormattedMessage id="entityCreate.endpointConfig.heading" />
            </Typography>

            {belowMd && docsURL && docsURL.length > 0 ? (
                <>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <ExternalLink link={docsURL}>
                        <FormattedMessage id="entityCreate.cta.docs" />
                    </ExternalLink>
                </>
            ) : null}
        </>
    );
}

export default EndpointConfigHeader;
