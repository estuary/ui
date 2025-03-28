import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import type { TaskShardDetails } from 'src/stores/ShardDetail/types';

interface Props {
    shard: TaskShardDetails;
    smallMargin?: boolean;
}

const INDICATOR_SIZE = 16;

function StatusIndicatorAndLabel({ shard, smallMargin }: Props) {
    const { id, color, disabled, messageId, messageNoteId } = shard;

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
                    <FormattedMessage id={messageId} />
                </Typography>
            </Box>

            {messageNoteId ? (
                <Typography
                    component="span"
                    style={{
                        marginLeft: NOTES_INDENT,
                        verticalAlign: 'middle',
                    }}
                >
                    <FormattedMessage id={messageNoteId} />
                </Typography>
            ) : null}
        </Stack>
    );
}

export default StatusIndicatorAndLabel;
