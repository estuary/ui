import { Box, Stack, useTheme } from '@mui/material';
import { Check } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { SourceCaptureOptionInfoProps } from './types';

function SourceCaptureOptionInfo({ messageKey }: SourceCaptureOptionInfoProps) {
    const intl = useIntl();
    const theme = useTheme();

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
                <Check
                    style={{
                        fontSize: 14,
                        color: theme.palette.success.main,
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
