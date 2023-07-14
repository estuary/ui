import { CircularProgress } from '@mui/material';
import { getStatsForDetails } from 'api/stats';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import KeyValueList from 'components/shared/KeyValueList';
import { useEntityType } from 'context/EntityContext';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import prettyBytes from 'pretty-bytes';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import readable from 'readable-numbers';
import { CatalogStats_Details } from 'types';

interface Props {
    entityName: string;
}

// TODO (details) want to make some kidn of summary of totals and potentially
//  include the cost. Leaving here as this can be used lated when we add this section
function TotalsSection({ entityName }: Props) {
    console.log('entityname', entityName);
    const intl = useIntl();
    const entityType = useEntityType();

    const { data, isValidating } = useSelectNew<CatalogStats_Details>(
        getStatsForDetails(entityName, entityType, 'monthly', {
            months: 1,
        }),
        {
            refreshInterval: 5000,
        }
    );

    const displayData = useMemo(() => {
        if (!isValidating && data?.data[0]) {
            const scope = data.data[0];

            return [
                {
                    title: intl.formatMessage({
                        id: 'data.data',
                    }),
                    val: prettyBytes(
                        scope.bytes_to
                            ? scope.bytes_to + scope.bytes_by
                            : scope.bytes_by,
                        {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                        }
                    ),
                },
                {
                    title: intl.formatMessage({
                        id: 'data.docs',
                    }),
                    val: readable(
                        scope.docs_to
                            ? scope.docs_to + scope.docs_by
                            : scope.docs_by,
                        3,
                        false
                    ),
                },
            ];
        }

        return null;
    }, [data?.data, intl, isValidating]);

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
