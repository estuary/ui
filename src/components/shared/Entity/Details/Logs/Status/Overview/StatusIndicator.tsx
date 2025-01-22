import { Skeleton, Stack } from '@mui/material';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { StatusIndicatorProps } from './types';

const INDICATOR_SIZE = 10;

export default function StatusIndicator({ status }: StatusIndicatorProps) {
    const hydrating = useEntityStatusStore((state) => !state.hydrated);

    if (hydrating) {
        return (
            <Skeleton
                height={21}
                width={INDICATOR_SIZE}
                style={{ marginRight: 8, marginTop: 1 }}
            />
        );
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
                    marginRight: 8,
                    marginTop: 1,
                    maxHeight: INDICATOR_SIZE,
                    maxWidth: INDICATOR_SIZE,
                    minHeight: INDICATOR_SIZE,
                    minWidth: INDICATOR_SIZE,
                    width: INDICATOR_SIZE,
                    verticalAlign: 'middle',
                }}
            />

            {/* TODO (entity-status): Remove if and when it is decided supplementary text
                  will not be displayed alongside the status indicator.
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
            </Typography> */}
        </Stack>
    );
}
