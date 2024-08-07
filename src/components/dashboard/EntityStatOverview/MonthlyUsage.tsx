import { DefaultStatsWithDocument, getStatsForDashboard } from 'api/stats';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { CatalogStats_Dashboard, Entity } from 'types';
import Statistic from './Statistic';

interface Props {
    entityType: Entity;
    byteUnit?: boolean;
}

// These values are defined in the following `flow` repository file: _ops-catalog/catalog-stats.ts_.
// TODO (typing): This type should be applied anywhere billing-related code needs to reference this property.
type FlowDocumentEntityIdentifier = 'capture' | 'materialize' | 'derive';

const getEntityIdentifier = (
    entityType: Entity
): FlowDocumentEntityIdentifier => {
    if (entityType === 'capture') {
        return 'capture';
    }

    if (entityType === 'materialization') {
        return 'materialize';
    }

    return 'derive';
};

const isDefaultStatistic = (
    datum: CatalogStats_Dashboard | DefaultStatsWithDocument
): datum is DefaultStatsWithDocument => 'bytes_read_by_me' in datum;

export default function MonthlyUsage({ entityType, byteUnit }: Props) {
    const intl = useIntl();

    const [loading, setLoading] = useState(true);
    const [usage, setUsage] = useState(0);

    const targetDocProp = getEntityIdentifier(entityType);

    useEffect(() => {
        const endDate = DateTime.utc().startOf('month');

        getStatsForDashboard(
            'melk',
            'monthly',
            endDate,
            undefined,
            entityType
        ).then(
            (response) => {
                if (response.data) {
                    let taskUsage = 0;

                    response.data
                        .filter(
                            ({ flow_document }) =>
                                Object.hasOwn(flow_document, 'taskStats') &&
                                Object.hasOwn(
                                    flow_document.taskStats,
                                    targetDocProp
                                )
                        )
                        .forEach((datum) => {
                            if (isDefaultStatistic(datum)) {
                                taskUsage +=
                                    entityType === 'materialization'
                                        ? datum.bytes_read_by_me
                                        : datum.bytes_written_by_me;

                                return;
                            }

                            taskUsage +=
                                entityType === 'materialization'
                                    ? datum.bytes_read ?? 0
                                    : datum.bytes_written ?? 0;
                        });

                    setUsage(taskUsage);
                }

                setLoading(false);
            },
            (error) => {
                console.log('error', error);
                setLoading(false);
            }
        );
    }, [entityType, targetDocProp]);

    return (
        <Statistic
            label={intl.formatMessage({
                id: 'filter.time.thisMonth',
            })}
            loading={loading}
            value={usage}
            byteUnit={byteUnit}
        />
    );
}
