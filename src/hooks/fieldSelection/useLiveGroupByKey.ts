import type { MaterializationBuiltBinding } from 'src/types/schemaModels';

import { useMemo } from 'react';

import { isEmpty } from 'lodash';

import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useEditorLiveSpec } from 'src/hooks/useLiveSpecsExt';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function useLiveGroupByKey(bindingUUID: string) {
    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    const backfilledBindings = useBindingStore(
        (state) => state.backfilledBindings
    );
    const selectionsExist = useBindingStore(
        (state) => !isEmpty(state.selections?.[bindingUUID].value)
    );
    const liveGroupByKey = useBindingStore(
        (state) => state.selections[bindingUUID].groupBy.liveGroupByKey
    );
    const draftedExplicitGroupByKey = useBindingStore(
        (state) => state.selections?.[bindingUUID].groupBy.value.explicit ?? []
    );

    const liveBuiltBindingIndex = useBindingStore(
        (state) =>
            state.resourceConfigs?.[bindingUUID].meta.liveBuiltBindingIndex ??
            -1
    );

    const liveBuiltSpec = useEditorLiveSpec(entityType)?.built_spec;

    const existingGroupByKey = useMemo(() => {
        const liveBuiltBinding: MaterializationBuiltBinding | undefined =
            liveBuiltBindingIndex > -1
                ? liveBuiltSpec?.bindings?.at(liveBuiltBindingIndex)
                : undefined;

        return liveBuiltBinding?.fieldSelection.keys ?? [];
    }, [liveBuiltBindingIndex, liveBuiltSpec]);

    const backfillRequired = useMemo(() => {
        const explicitKeysDiffer =
            draftedExplicitGroupByKey.length !== liveGroupByKey.length ||
            liveGroupByKey.some((key, index) =>
                index < draftedExplicitGroupByKey.length
                    ? draftedExplicitGroupByKey[index] !== key
                    : false
            );

        return (
            isEdit &&
            selectionsExist &&
            !backfilledBindings.includes(bindingUUID) &&
            explicitKeysDiffer
        );
    }, [
        backfilledBindings,
        bindingUUID,
        draftedExplicitGroupByKey,
        isEdit,
        liveGroupByKey,
        selectionsExist,
    ]);

    return { backfillRequired, existingGroupByKey };
}
