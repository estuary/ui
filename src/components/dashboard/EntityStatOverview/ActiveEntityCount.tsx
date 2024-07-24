import { getLiveSpecShards } from 'api/liveSpecsExt';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { Entity } from 'types';
import Statistic from './Statistic';

interface Props {
    entityType: Entity;
}

export default function ActiveEntityCount({ entityType }: Props) {
    const intl = useIntl();

    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);

    useMount(() => {
        getLiveSpecShards(entityType)
            .then(
                (response) => {
                    if (response.data) {
                        const entityCount = response.data.filter(
                            ({ disable }) => disable !== true
                        ).length;

                        setCount(entityCount);
                    }
                },
                (error) => {
                    console.log('error', error);
                }
            )
            .finally(() => {
                setLoading(false);
            });
    });

    return (
        <Statistic
            label={intl.formatMessage({
                id: 'data.active',
            })}
            loading={loading}
            value={count}
        />
    );
}
