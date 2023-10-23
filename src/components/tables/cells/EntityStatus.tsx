import { Box, Tooltip, Typography } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { FormattedMessage } from 'react-intl';
import { useShardDetail_readDictionary } from 'stores/ShardDetail/hooks';

interface Props {
    name: string;
}

const indicatorSize = 16;

function EntityStatus({ name }: Props) {
    const taskType = useEntityType();

    const dictionaryVals = useShardDetail_readDictionary(name, taskType);

    return (
        <Tooltip
            disableInteractive={dictionaryVals.allShards.length === 0}
            title={dictionaryVals.allShards.map((shard, index) => (
                <Box
                    key={`${index}-shard-status-tooltip`}
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <span
                        style={{
                            height: 12,
                            width: 12,
                            marginRight: 4,
                            border: shard.disabled
                                ? `solid 2px ${shard.color}`
                                : 0,
                            backgroundColor: shard.disabled ? '' : shard.color,
                            borderRadius: 50,
                            display: 'inline-block',
                            verticalAlign: 'middle',
                        }}
                    />

                    <Typography
                        variant="caption"
                        sx={{ display: 'inline-block' }}
                    >
                        <FormattedMessage id={shard.messageId} />
                    </Typography>
                </Box>
            ))}
            placement="bottom-start"
        >
            <span
                style={{
                    height: indicatorSize,
                    width: indicatorSize,
                    minWidth: indicatorSize,
                    maxWidth: indicatorSize,
                    minHeight: indicatorSize,
                    maxHeight: indicatorSize,

                    marginRight: 12,
                    border: dictionaryVals.disabled
                        ? `solid 2px ${dictionaryVals.compositeColor}`
                        : 0,
                    backgroundColor: dictionaryVals.disabled
                        ? ''
                        : dictionaryVals.compositeColor,
                    borderRadius: 50,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                }}
            />
        </Tooltip>
    );
}

export default EntityStatus;
