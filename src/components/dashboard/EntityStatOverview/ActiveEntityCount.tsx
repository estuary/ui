import { useIntl } from 'react-intl';
import { Entity } from 'types';
import Statistic from './Statistic';
import useActiveEntityCount from './useActiveEntityCount';

interface Props {
    entityType: Entity;
}

export default function ActiveEntityCount({ entityType }: Props) {
    const intl = useIntl();

    const { count, loading } = useActiveEntityCount(entityType);

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
