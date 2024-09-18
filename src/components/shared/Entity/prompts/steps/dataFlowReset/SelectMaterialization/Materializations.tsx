import { Box, LinearProgress, Typography } from '@mui/material';
import Error from 'components/shared/Error';
import { useLiveSpecsExt_related } from 'hooks/useLiveSpecsExt';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import Selector from './Selector';
import { BindingReviewProps } from './types';

function Materializations({ selected }: BindingReviewProps) {
    const intl = useIntl();

    const { related, error, isValidating } = useLiveSpecsExt_related(selected);

    const foundData = useMemo(() => hasLength(related), [related]);

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
                <Selector keys={related} value={null} />
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

export default Materializations;
