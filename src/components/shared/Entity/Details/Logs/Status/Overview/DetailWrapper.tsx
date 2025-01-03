import { Box, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { DetailWrapperProps } from './types';

export default function DetailWrapper({
    children,
    headerMessageId,
    Loading,
}: DetailWrapperProps) {
    const intl = useIntl();

    return (
        <Box>
            <Typography noWrap style={{ color: '#70767E', marginBottom: 2 }}>
                {intl.formatMessage({ id: headerMessageId })}
            </Typography>

            {Loading ?? children}
        </Box>
    );
}
