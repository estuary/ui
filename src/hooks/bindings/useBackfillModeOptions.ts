import type { BaseAutoCompleteOption } from 'src/components/shared/specPropEditor/types';
import type { BackfillMode } from 'src/stores/Binding/slices/Backfill';

import { useBindingStore } from 'src/stores/Binding/Store';

function useBackfillModeOptions() {
    const backfillMode = useBindingStore((state) => state.backfillMode);

    const isOptionEqualToValue = (
        option: BaseAutoCompleteOption<BackfillMode>
    ) => Boolean(option.val === backfillMode);

    const options: BaseAutoCompleteOption<BackfillMode>[] = [
        {
            description:
                'Backfill data from the source, reset inferred schemas, drop and re-create all destination tables and derivations.',
            label: 'Dataflow Reset',
            val: 'reset',
        },
        {
            description:
                'Re-extract all source data and Insert or Append into your existing destination tables without dropping and recreating them.',
            label: 'Incremental backfill (advanced)',
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
