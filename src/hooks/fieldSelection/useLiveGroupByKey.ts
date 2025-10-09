import type { MaterializationBuiltBinding } from 'src/types/schemaModels';

import { useMemo } from 'react';

import { isEmpty } from 'lodash';

import { useEditorStore_liveBuiltSpec } from 'src/components/editor/Store/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function useLiveGroupByKey(bindingUUID: string) {
    const backfilledBindings = useBindingStore(
        (state) => state.backfilledBindings
    );
    const selectionsExist = useBindingStore(
        (state) => !isEmpty(state.selections?.[bindingUUID].value)
    );
    const draftedGroupByKeys = useBindingStore((state) => {
        if (bindingUUID && !state.selections?.[bindingUUID]) {
            return [];
        }

        return state.selections[bindingUUID].groupBy.explicit;
    });

    const liveBuiltBindingIndex = useBindingStore(
        (state) =>
            state.resourceConfigs?.[bindingUUID].meta.liveBuiltBindingIndex ??
            -1
    );

    const liveBuiltSpec = useEditorStore_liveBuiltSpec();

    const existingGroupByKey = useMemo(() => {
        const liveBuiltBinding: MaterializationBuiltBinding | undefined =
            liveBuiltBindingIndex > -1
                ? liveBuiltSpec?.bindings.at(liveBuiltBindingIndex)
                : undefined;

        return liveBuiltBinding?.fieldSelection.keys ?? [];
    }, [liveBuiltBindingIndex, liveBuiltSpec]);

    const backfillRequired = useMemo(
        () =>
            selectionsExist &&
            !backfilledBindings.includes(bindingUUID) &&
            (existingGroupByKey.length !== draftedGroupByKeys.length ||
                existingGroupByKey.some((key, index) =>
                    index < draftedGroupByKeys.length
                        ? draftedGroupByKeys[index] !== key
                        : false
                )),
        [
            backfilledBindings,
            bindingUUID,
            draftedGroupByKeys,
            existingGroupByKey,
            selectionsExist,
        ]
    );

    return { backfillRequired, existingGroupByKey };
}
