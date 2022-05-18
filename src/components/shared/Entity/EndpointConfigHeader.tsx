import { Divider, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage } from 'react-intl';

interface Props {
    docsPath?: string;
}

function EndpointConfigHeader({ docsPath }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="foo.endpointConfig.heading" />
            </Typography>

            {docsPath && docsPath.length > 0 ? (
                <>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mx: 1,
                        }}
                    />
                    <ExternalLink link={docsPath}>
                        <FormattedMessage id="foo.ctas.docs" />
                    </ExternalLink>
                </>
            ) : null}
        </>
    );
}

export default EndpointConfigHeader;
