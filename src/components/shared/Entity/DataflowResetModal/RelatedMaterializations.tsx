import { Box, LinearProgress, Typography } from '@mui/material';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import ChipList from 'components/shared/ChipList';
import Error from 'components/shared/Error';
import { useConfirmationModalContext } from 'context/Confirmation';
import { supabaseClient } from 'context/GlobalProviders';
import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { TABLES } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import { BindingReviewProps } from './types';

function RelatedMaterializations({ selected }: BindingReviewProps) {
    const intl = useIntl();

    const { data, error, isValidating } = useQuery(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select('catalog_name')
            .eq('spec_type', 'materialization')
            .overlaps('reads_from', selected),
        {}
    );

    const confirmationModal = useConfirmationModalContext();

    const foundData = useMemo(() => hasLength(data), [data]);

    useEffect(() => {
        if (!isValidating && !foundData) {
            confirmationModal?.setContinueAllowed(true);
        }
    }, [foundData, isValidating, confirmationModal]);

    return (
        <Box>
            <Typography>
                {intl.formatMessage({
                    id: 'resetDataFlow.materializations.header',
                })}
            </Typography>

            {isValidating ? <LinearProgress /> : null}

            {error ? <Error error={error} condensed /> : null}

            {!error && foundData ? (
                <ChipList
                    values={data ? data.map((datum) => datum.catalog_name) : []}
                    maxChips={10}
                />
            ) : (
                <Box>
                    {intl.formatMessage({
                        id: 'resetDataFlow.materializations.empty',
                    })}
                </Box>
            )}
        </Box>
    );
}

export default RelatedMaterializations;
