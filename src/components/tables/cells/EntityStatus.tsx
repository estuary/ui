import { Box, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useShardDetail_dictionaryHydrated,
    useShardDetail_readDictionary,
} from 'stores/ShardDetail/hooks';
import {
    ShardEntityTypes,
    ShardStatusMessageIds,
} from 'stores/ShardDetail/types';

interface Props {
    name: string;
    taskTypes: ShardEntityTypes[];
}

const indicatorSize = 16;

function EntityStatus({ name, taskTypes }: Props) {
    const dictionaryHydrated = useShardDetail_dictionaryHydrated();
    const dictionaryVals = useShardDetail_readDictionary(name, taskTypes);

    const shards = useMemo(() => {
        const response = {
            color: dictionaryVals.compositeColor,
            disabled: dictionaryVals.disabled,
        };
        if (dictionaryHydrated) {
            if (dictionaryVals.allShards.length > 0) {
                return dictionaryVals.allShards;
            }

            return [
                {
                    ...response,
                    messageId: dictionaryVals.defaultMessageId,
                },
            ];
        }

        return [
            {
                ...response,
                messageId: ShardStatusMessageIds.NONE,
            },
        ];
    }, [
        dictionaryHydrated,
        dictionaryVals.allShards,
        dictionaryVals.compositeColor,
        dictionaryVals.defaultMessageId,
        dictionaryVals.disabled,
    ]);

    const tooltipContent = useMemo(() => {
        return shards.map((shard, index) => (
            <Box
                key={`${index}-shard-status-tooltip`}
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                <span
                    style={{
                        height: 12,
                        width: 12,
                        marginRight: 4,
                        border: shard.disabled ? `solid 2px ${shard.color}` : 0,
                        backgroundColor: shard.disabled ? '' : shard.color,
                        borderRadius: 50,
                        display: 'inline-block',
                        verticalAlign: 'middle',
                    }}
                />

                <Typography variant="caption" sx={{ display: 'inline-block' }}>
                    <FormattedMessage id={shard.messageId} />
                </Typography>
            </Box>
        ));
    }, [shards]);

    return (
        <Tooltip title={tooltipContent} placement="bottom-start">
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
