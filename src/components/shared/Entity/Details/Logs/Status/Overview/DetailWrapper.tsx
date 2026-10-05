import type { DetailWrapperProps } from 'src/components/shared/Entity/Details/Logs/Status/Overview/types';

import { Box, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { diminishedTextColor } from 'src/context/Theme';

function DetailWrapper({
    children,
    header,
    Hydrating,
}: Omit<DetailWrapperProps, 'headerMessageId'> & { header: string }) {
    return (
        <Box>
            <Typography
                noWrap
                sx={{
                    color: (theme) => diminishedTextColor[theme.palette.mode],
                    mb: '2px',
                }}
            >
                {header}
            </Typography>

            {Hydrating ?? children}
        </Box>
    );
}

/** @deprecated Prefer the named `DetailWrapper` export */
export default function DeprecatedDetailWrapper({
    headerMessageId,
    ...props
}: DetailWrapperProps) {
    const intl = useIntl();

    return (
        <DetailWrapper
            {...props}
            header={intl.formatMessage({ id: headerMessageId })}
        />
    );
}
