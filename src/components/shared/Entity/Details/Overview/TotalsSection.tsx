import { CircularProgress, Stack, Typography } from '@mui/material';
import { DetailsStats, getStatsForDetails } from 'api/stats';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import { useEntityType } from 'context/EntityContext';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import prettyBytes from 'pretty-bytes';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import readable from 'readable-numbers';

interface Props {
    entityName: string;
}

function TotalsSection({ entityName }: Props) {
    console.log('entityname', entityName);
    const entityType = useEntityType();

    const { data, isValidating } = useSelectNew<DetailsStats>(
        getStatsForDetails(entityName, entityType, 'monthly', {
            months: 1,
        })
    );

    const displayData = useMemo(() => {
        if (!isValidating && data?.data) {
            const scope: any = data.data[0];

            return {
                bytes: prettyBytes(scope.bytes_by, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
                docs: readable(scope.docs_by, 2, false),
            };
        }

        return null;
    }, [data?.data, isValidating]);

    console.log('data', data);

    return (
        <CardWrapper
            height={undefined}
            message={<FormattedMessage id="detailsPanel.totals.title" />}
        >
            {!displayData ? (
                <CircularProgress />
            ) : (
                <Stack>
                    <Typography>Bytes: {displayData.docs}</Typography>
                    <Typography>Docs: {displayData.bytes}</Typography>
                </Stack>
            )}
        </CardWrapper>
    );
}

export default TotalsSection;
