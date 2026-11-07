import type { Entity } from 'src/types';

import Statistic from 'src/components/home/dashboard/EntityStatOverview/Statistic';
import useActiveEntityCount from 'src/components/home/dashboard/EntityStatOverview/useActiveEntityCount';

interface Props {
    entityType: Entity;
}

export default function ActiveEntityCount({ entityType }: Props) {
    const { count, error, indeterminate, isLoading } =
        useActiveEntityCount(entityType);

    return (
        <Statistic
            error={error}
            indeterminate={indeterminate}
            label="Active"
            loading={isLoading}
            tooltip=""
            value={count}
        />
    );
}
