import type { Entity } from 'types';
import { useIntl } from 'react-intl';
import Statistic from './Statistic';
import useActiveEntityCount from './useActiveEntityCount';

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
