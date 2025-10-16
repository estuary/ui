import type { MaterializationBuiltBinding } from 'src/types/schemaModels';

import { useMemo } from 'react';

import { isEmpty } from 'lodash';

import { useEditorStore_liveBuiltSpec } from 'src/components/editor/Store/hooks';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function useLiveGroupByKey(bindingUUID: string) {
    const isEdit = useEntityWorkflow_Editing();

    const backfilledBindings = useBindingStore(
        (state) => state.backfilledBindings
    );
    const selectionsExist = useBindingStore(
        (state) => !isEmpty(state.selections?.[bindingUUID].value)
    );
    const draftedGroupByKey = useBindingStore((state) => {
        if (bindingUUID && !state.selections?.[bindingUUID]) {
            return [];
        }

        const { explicit, implicit } = state.selections[bindingUUID].groupBy;

        return explicit.length > 0 ? explicit : implicit;
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
            isEdit &&
            selectionsExist &&
            !backfilledBindings.includes(bindingUUID) &&
            (existingGroupByKey.length !== draftedGroupByKey.length ||
                existingGroupByKey.some((key, index) =>
                    index < draftedGroupByKey.length
                        ? draftedGroupByKey[index] !== key
                        : false
                )),
        [
            backfilledBindings,
            bindingUUID,
            draftedGroupByKey,
            existingGroupByKey,
            isEdit,
            selectionsExist,
        ]
    );

    return { backfillRequired, existingGroupByKey };
}
