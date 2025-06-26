import type { BaseAutoCompleteOption } from 'src/components/shared/specPropEditor/types';
import type { BackfillMode } from 'src/stores/Binding/slices/Backfill';

import { useIntl } from 'react-intl';

import { useBindingStore } from 'src/stores/Binding/Store';

function useBackfillModeOptions() {
    const intl = useIntl();
    const [backfillMode] = useBindingStore((state) => [state.backfillMode]);

    const isOptionEqualToValue = (
        option: BaseAutoCompleteOption<BackfillMode>
    ) => Boolean(option.val === backfillMode);

    const options: BaseAutoCompleteOption<BackfillMode>[] = [
        {
            description: intl.formatMessage({
                id: 'workflows.dataFlowBackfill.options.reset.description',
            }),
            label: intl.formatMessage({
                id: 'workflows.dataFlowBackfill.options.reset.label',
            }),
            val: 'reset',
        },
        {
            description: intl.formatMessage({
                id: 'workflows.dataFlowBackfill.options.incremental.description',
            }),
            label: intl.formatMessage({
                id: 'workflows.dataFlowBackfill.options.incremental.label',
            }),
            val: 'incremental',
        },
    ];

    const currentOption: BaseAutoCompleteOption<BackfillMode> | null =
        options.find(isOptionEqualToValue) ?? null;

    return {
        currentOption,
        isOptionEqualToValue,
        options,
    };
}

export default useBackfillModeOptions;
