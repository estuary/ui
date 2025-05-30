import type { SourceCaptureChipOptionProps } from 'src/components/materialization/source/Capture/types';

import { Box, Stack, useTheme } from '@mui/material';

import { Check, Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

function SourceCaptureChipOption({
    enabled,
    messageKey,
}: SourceCaptureChipOptionProps) {
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
            }}
        >
            <Box component="span">
                <Icon
                    style={{
                        color: enabled
                            ? theme.palette.success.main
                            : theme.palette.error.main,
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

export default SourceCaptureChipOption;
