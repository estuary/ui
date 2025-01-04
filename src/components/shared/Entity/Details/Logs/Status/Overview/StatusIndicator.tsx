import { Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { useShallow } from 'zustand/react/shallow';
import { StatusIndicatorProps } from './types';

const INDICATOR_SIZE = 10;

export default function StatusIndicator({ status }: StatusIndicatorProps) {
    const intl = useIntl();
    const theme = useTheme();

    const loading = useEntityStatusStore(
        useShallow((state) => Boolean(!state.response))
    );

    if (loading) {
        return <Skeleton height={21} width={50} />;
    }

    return (
        <Stack
            direction="row"
            style={{
                alignItems: 'center',
            }}
        >
            <span
                style={{
                    backgroundColor: status.color.hex,
                    borderRadius: 50,
                    display: 'inline-block',
                    height: INDICATOR_SIZE,
                    marginRight: 6,
                    marginTop: 1,
                    maxHeight: INDICATOR_SIZE,
                    maxWidth: INDICATOR_SIZE,
                    minHeight: INDICATOR_SIZE,
                    minWidth: INDICATOR_SIZE,
                    width: INDICATOR_SIZE,
                    verticalAlign: 'middle',
                }}
            />

            <Typography
                style={{
                    color:
                        theme.palette.mode === 'light'
                            ? theme.palette[status.color.id].dark
                            : theme.palette[status.color.id].main,
                    fontWeight: 300,
                }}
            >
                {intl.formatMessage({ id: status.messageId })}
            </Typography>
        </Stack>
    );
}
