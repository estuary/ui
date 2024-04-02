import { Box, Stack, TableCell, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TaskShardDetails } from 'stores/ShardDetail/types';

interface Props {
    shard: TaskShardDetails;
}

const INDICATOR_SIZE = 16;
const INDICATOR_MARGIN = 12;
const NOTES_INDENT = INDICATOR_SIZE + INDICATOR_MARGIN;

function StatusIndicatorAndLabel({ shard }: Props) {
    const { id, color, disabled, messageId, messageNoteId } = shard;

    return (
        <TableCell width={250} key={`status-indicator-for-shard__${id}`}>
            <Stack>
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

                    <Typography
                        component="span"
                        sx={{ verticalAlign: 'middle' }}
                    >
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
        </TableCell>
    );
}

export default StatusIndicatorAndLabel;
