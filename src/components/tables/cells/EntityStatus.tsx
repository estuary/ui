import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

import { useMemo } from 'react';

import { Tooltip } from '@mui/material';

import StatusIndicatorAndLabel from 'src/components/shared/Entity/Shard/StatusIndicatorAndLabel';
import {
    useShardDetail_dictionaryHydrated,
    useShardDetail_readDictionary,
} from 'src/stores/ShardDetail/hooks';
import { ShardStatusMessageIds } from 'src/stores/ShardDetail/types';

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
            <StatusIndicatorAndLabel
                smallMargin
                shard={shard}
                key={`${index}-shard-status-tooltip`}
            />
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
