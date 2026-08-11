import type { BindingStatus } from 'src/components/shared/Entity/Details/Overview/Bindings/types';

import { Box, Stack, TableCell, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import { diminishedTextColor, successMain } from 'src/context/Theme';

const INDICATOR_SIZE = 8;

// "Enabled" rather than "Active": the spec's `disable` flag only says the
// binding is not switched off, which is not a claim that data is flowing. A
// binding that is enabled but quiet reads as quiet from the Docs and Data
// columns, both of which sort.
const LABEL_IDS: Record<BindingStatus, string> = {
    enabled: 'detailsPanel.bindings.status.enabled',
    disabled: 'detailsPanel.bindings.status.disabled',
};

interface Props {
    status: BindingStatus;
}

function StatusCell({ status }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const color =
        status === 'enabled'
            ? successMain
            : diminishedTextColor[theme.palette.mode];

    return (
        <TableCell>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box
                    component="span"
                    sx={{
                        backgroundColor: color,
                        borderRadius: '50%',
                        display: 'inline-block',
                        flex: 'none',
                        height: INDICATOR_SIZE,
                        width: INDICATOR_SIZE,
                    }}
                />

                <Typography
                    component="div"
                    sx={{
                        color:
                            status === 'enabled'
                                ? undefined
                                : diminishedTextColor[theme.palette.mode],
                        whiteSpace: 'nowrap',
                    }}
                >
                    {intl.formatMessage({ id: LABEL_IDS[status] })}
                </Typography>
            </Stack>
        </TableCell>
    );
}

export default StatusCell;
