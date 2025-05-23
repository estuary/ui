import { Chip } from '@mui/material';

import { useIntl } from 'react-intl';

import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';

function SelectedChip() {
    const intl = useIntl();
    const stepIndex = useLoopIndex();

    const [backfillTarget, targetHasOverlap] = usePreSavePromptStore(
        (state) => [
            state.context.backfillTarget,
            state.context.targetHasOverlap,
        ]
    );

    const [updateStep, updateContext] = usePreSavePromptStore((state) => [
        state.updateStep,
        state.updateContext,
    ]);

    return (
        <Chip
            color={
                backfillTarget
                    ? targetHasOverlap
                        ? 'success'
                        : 'error'
                    : 'info'
            }
            label={
                backfillTarget?.catalog_name ??
                intl.formatMessage({
                    id: 'resetDataFlow.materializations.chip.empty',
                })
            }
            variant="outlined"
            style={{ maxWidth: '60%', textTransform: 'lowercase' }}
            onDelete={
                backfillTarget
                    ? async () => {
                          updateStep(stepIndex, {
                              valid: false,
                          });
                          updateContext({
                              backfillTarget: null,
                          });
                      }
                    : undefined
            }
        />
    );
}

export default SelectedChip;
