import { CircularProgress } from '@mui/material';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getStatsForDetails } from 'api/stats';
import { DataGrains } from 'components/graphs/types';
import CardWrapper from 'components/shared/CardWrapper';
import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import { useEntityType } from 'context/EntityContext';
import prettyBytes from 'pretty-bytes';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import readable from 'readable-numbers';
import { convertRangeToSettings } from 'services/luxon';

interface Props {
    entityName: string;
}

// TODO (details) want to make some kind of summary of totals and potentially
//  include the cost. Leaving here as this can be used lated when we add this section
function TotalsSection({ entityName }: Props) {
    const intl = useIntl();
    const entityType = useEntityType();

    const { data, isValidating } = useQuery(
        getStatsForDetails(
            entityName,
            entityType,
            convertRangeToSettings({
                amount: 1,
                grain: DataGrains.monthly,
            })
        ),
        {
            refreshInterval: 5000,
        }
    );

    const displayData = useMemo<KeyValue[] | null>(() => {
        if (!isValidating && data?.[0]) {
            const scope = data[0];

            const totalBytes =
                (scope.bytes_read ?? 0) + (scope.bytes_written ?? 0);
            const totalDocs =
                (scope.docs_read ?? 0) + (scope.docs_written ?? 0);

            return [
                {
                    title: intl.formatMessage({
                        id: 'data.data',
                    }),
                    val: prettyBytes(totalBytes, {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                    }),
                },
                {
                    title: intl.formatMessage({
                        id: 'data.docs',
                    }),
                    val: readable(totalDocs, 3, false),
                },
            ];
        }

        return null;
    }, [data, intl, isValidating]);

    return (
        <CardWrapper
            message={<FormattedMessage id="detailsPanel.totals.title" />}
        >
            {!displayData ? (
                <CircularProgress />
            ) : (
                <KeyValueList data={displayData} />
            )}
        </CardWrapper>
    );
}

export default TotalsSection;
