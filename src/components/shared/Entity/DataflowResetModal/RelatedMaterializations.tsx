import { Box, Skeleton, Typography } from '@mui/material';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import ChipList from 'components/shared/ChipList';
import Error from 'components/shared/Error';
import { useConfirmationModalContext } from 'context/Confirmation';
import { supabaseClient } from 'context/GlobalProviders';
import { useEffect, useMemo } from 'react';
import { TABLES } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import { BindingReviewProps } from './types';

function RelatedMaterializations({ selected }: BindingReviewProps) {
    const confirmationModal = useConfirmationModalContext();

    const { data, error, isValidating } = useQuery(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select('catalog_name')
            .eq('spec_type', 'materialization')
            .overlaps('reads_from', selected)
    );

    const foundData = useMemo(() => hasLength(data), [data]);

    useEffect(() => {
        if (!isValidating && !foundData) {
            confirmationModal?.setContinueAllowed(true);
        }
    }, [foundData, isValidating, confirmationModal]);

    if (isValidating) {
        return <Skeleton />;
    }

    if (error) {
        return <Error error={error} />;
    }

    return (
        <Box>
            <Typography>
                Select which Materialization you want backfilled
            </Typography>
            {foundData ? (
                <ChipList
                    values={data ? data.map((datum) => datum.catalog_name) : []}
                    maxChips={10}
                />
            ) : (
                <Box>No related materializations.</Box>
            )}
        </Box>
    );
}

export default RelatedMaterializations;
