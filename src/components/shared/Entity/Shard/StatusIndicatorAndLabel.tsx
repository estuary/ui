import type { TaskShardDetails } from 'src/stores/ShardDetail/types';

import { Box, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

interface Props {
    shard: TaskShardDetails;
    smallMargin?: boolean;
    label: string;
    note?: string;
}

const INDICATOR_SIZE = 16;

export function StatusIndicatorAndLabel({
    shard,
    smallMargin,
    label,
    note,
}: Props) {
    const { id, color, disabled } = shard;

    const INDICATOR_MARGIN = smallMargin ? 4 : 12;
    const NOTES_INDENT = INDICATOR_SIZE + INDICATOR_MARGIN;

    return (
        <Stack key={`status-indicator-for-shard__${id}`}>
            <Box>
                <span
                    style={{
                        height: INDICATOR_SIZE,
                        width: INDICATOR_SIZE,
                        marginRight: INDICATOR_MARGIN,
                        border: disabled ? `solid 2px ${color}` : 0,
                        backgroundColor: disabled ? '' : color,
                        borderRadius: 50,
                        display: 'inline-block',
                        verticalAlign: 'middle',
                    }}
                />

                <Typography component="span" sx={{ verticalAlign: 'middle' }}>
                    {label}
                </Typography>
            </Box>

            {note ? (
                <Typography
                    component="span"
                    style={{
                        marginLeft: NOTES_INDENT,
                        verticalAlign: 'middle',
                    }}
                >
                    {note}
                </Typography>
            ) : null}
        </Stack>
    );
}

/** @deprecated Prefer the named `StatusIndicatorAndLabel` export */
function StatusIndicatorAndLabelWrapper({
    shard,
    ...props
}: {
    shard: TaskShardDetails;
    smallMargin?: boolean;
}) {
    const intl = useIntl();

    return (
        <StatusIndicatorAndLabel
            {...props}
            shard={shard}
            label={intl.formatMessage({ id: shard.messageId })}
            note={
                shard.messageNoteId
                    ? intl.formatMessage({ id: shard.messageNoteId })
                    : undefined
            }
        />
    );
}

export default StatusIndicatorAndLabelWrapper;
