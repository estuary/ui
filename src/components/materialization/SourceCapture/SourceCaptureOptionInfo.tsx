import { Box, Stack, useTheme } from '@mui/material';
import { Check, Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { SourceCaptureOptionInfoProps } from './types';

function SourceCaptureOptionInfo({
    enabled,
    messageKey,
}: SourceCaptureOptionInfoProps) {
    const intl = useIntl();
    const theme = useTheme();

    const Icon = enabled ? Check : Xmark;

    return (
        <Stack
            direction="row"
            spacing={1}
            style={{
                alignItems: 'center',
                minWidth: 'min-content',
                width: 'min-content',
                whiteSpace: 'break-spaces',
            }}
        >
            <Box component="span">
                <Icon
                    style={{
                        color: enabled
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        opacity: enabled ? 1 : 0.7,
                        fontSize: 14,
                    }}
                />
            </Box>

            <Box component="span">
                {intl.formatMessage({
                    id: messageKey,
                })}
            </Box>
        </Stack>
    );
}

export default SourceCaptureOptionInfo;
