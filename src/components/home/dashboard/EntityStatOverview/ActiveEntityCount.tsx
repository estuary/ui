import { useIntl } from 'react-intl';
import type { Entity } from 'src/types';
import Statistic from 'src/components/home/dashboard/EntityStatOverview/Statistic';
import useActiveEntityCount from 'src/components/home/dashboard/EntityStatOverview/useActiveEntityCount';


interface Props {
    entityType: Entity;
}

export default function ActiveEntityCount({ entityType }: Props) {
    const intl = useIntl();

    const { count, error, indeterminate, isLoading } =
        useActiveEntityCount(entityType);

    return (
        <Statistic
            error={error}
            indeterminate={indeterminate}
            label={intl.formatMessage({
                id: 'data.active',
            })}
            loading={isLoading}
            tooltip=""
            value={count}
        />
    );
}
