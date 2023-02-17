import { Divider, Typography, useTheme } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { useEndpointConfigStore_errorsExist } from 'stores/EndpointConfig/hooks';

interface Props {
    docsPath?: string;
}

function EndpointConfigHeader({ docsPath }: Props) {
    const theme = useTheme();

    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();

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

            {docsPath && docsPath.length > 0 ? (
                <>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <ExternalLink link={docsPath}>
                        <FormattedMessage id="entityCreate.ctas.docs" />
                    </ExternalLink>
                </>
            ) : null}
        </>
    );
}

export default EndpointConfigHeader;
