import type { AlertCardHeaderProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';
import { cardHeaderSx, truncateTextSx } from 'src/context/Theme';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCardHeader({ datum }: AlertCardHeaderProps) {
    const intl = useIntl();

    const getAlertTypeContent = useAlertTypeContent();
    const { docLink, humanReadable } = getAlertTypeContent(datum);

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography
                sx={{
                    ...cardHeaderSx,
                    ...(truncateTextSx as any),
                }}
            >
                {humanReadable}
            </Typography>

            {docLink ? (
                <ExternalLink link={docLink}>
                    {intl.formatMessage({ id: 'terms.documentation' })}
                </ExternalLink>
            ) : null}
        </Stack>
    );
}

export default AlertCardHeader;
