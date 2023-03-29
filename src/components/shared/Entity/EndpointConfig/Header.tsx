import { Divider, Typography, useMediaQuery, useTheme } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { useEndpointConfigStore_errorsExist } from 'stores/EndpointConfig/hooks';
import { useSidePanelDocsStore_url } from 'stores/SidePanelDocs/hooks';

function EndpointConfigHeader() {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    const docsUrl = useSidePanelDocsStore_url();

    return (
        <>
            {endpointConfigErrorsExist ? (
                <WarningCircle
                    style={{
                        marginRight: 4,
                        fontSize: 12,
                        color: theme.palette.error.main,
                    }}
                />
            ) : null}

            <Typography variant="subtitle1">
                <FormattedMessage id="entityCreate.endpointConfig.heading" />
            </Typography>

            {belowMd && docsUrl && docsUrl.length > 0 ? (
                <>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <ExternalLink link={docsUrl}>
                        <FormattedMessage id="entityCreate.cta.docs" />
                    </ExternalLink>
                </>
            ) : null}
        </>
    );
}

export default EndpointConfigHeader;
