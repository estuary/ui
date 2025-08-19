import type { AlertCardHeaderProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCardHeader({ datum }: AlertCardHeaderProps) {
    const intl = useIntl();
    const { docLink, humanReadable } = useAlertTypeContent(datum);

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography>{humanReadable}</Typography>

            {docLink ? (
                <ExternalLink link={docLink}>
                    {intl.formatMessage({ id: 'terms.documentation' })}
                </ExternalLink>
            ) : null}
        </Stack>
    );
}

export default AlertCardHeader;
