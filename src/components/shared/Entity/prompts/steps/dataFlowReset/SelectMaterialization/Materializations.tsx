import { Box, LinearProgress, Typography } from '@mui/material';
import Error from 'components/shared/Error';
import { useLiveSpecsExt_related } from 'hooks/useLiveSpecsExt';
import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import { hasLength } from 'utils/misc-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';
import Selector from './Selector';
import { BindingReviewProps } from './types';

function Materializations({ selected }: BindingReviewProps) {
    const intl = useIntl();

    const { related, error, isValidating } = useLiveSpecsExt_related(selected);

    const updateStep = usePreSavePromptStore((state) => state.updateStep);

    const foundData = useMemo(() => hasLength(related), [related]);

    const [backfillDataFlowTarget] = useBindingStore((state) => [
        state.backfillDataFlowTarget,
    ]);

    useEffect(() => {
        updateStep(1, {
            valid: Boolean(
                (!isValidating && !foundData) || backfillDataFlowTarget
            ),
        });
    }, [backfillDataFlowTarget, foundData, isValidating, updateStep]);

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
