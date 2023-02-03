import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Divider, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage } from 'react-intl';
import { useEndpointConfigStore_errorsExist } from 'stores/EndpointConfig';

interface Props {
    docsPath?: string;
}

function EndpointConfigHeader({ docsPath }: Props) {
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();

    return (
        <>
            {endpointConfigErrorsExist ? (
                <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />
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
