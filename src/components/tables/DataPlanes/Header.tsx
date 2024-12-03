import { Stack, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { useIntl } from 'react-intl';

const docsUrl = 'https://docs.estuary.dev/getting-started/deployment-options/';

function Header() {
    const intl = useIntl();

    return (
        <Stack direction="row" spacing={1}>
            <Typography
                component="span"
                variant="h6"
                sx={{
                    alignItems: 'center',
                }}
            >
                {intl.formatMessage({
                    id: 'admin.dataPlanes.private.header',
                })}
            </Typography>
            <ExternalLink link={docsUrl}>
                {intl.formatMessage({ id: 'terms.documentation' })}
            </ExternalLink>
        </Stack>
    );
}

export default Header;
