import type { RelatedBindings } from 'src/utils/workflow-utils';

import { useEffect, useState } from 'react';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useBinding_currentBindingIndex } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { getRelatedBindings } from 'src/utils/workflow-utils';

export default function useRelatedBindings() {
    const currentCollection = useBindingStore(
        (state) => state.currentBinding?.collection
    );
    const stagedBindingIndex = useBinding_currentBindingIndex();

    const draftSpecsRows = useEditorStore_queryResponse_draftSpecs();

    const [relatedBindings, setRelatedBindings] = useState<RelatedBindings>({
        builtBinding: undefined,
        draftedBinding: undefined,
        liveBinding: undefined,
        validatedBinding: undefined,
    });

    useEffect(() => {
        if (
            currentCollection &&
            draftSpecsRows.length > 0 &&
            draftSpecsRows[0].spec &&
            draftSpecsRows[0].built_spec &&
            draftSpecsRows[0].validated
        ) {
            const response = getRelatedBindings(
                draftSpecsRows[0].built_spec ?? {},
                draftSpecsRows[0].spec,
                stagedBindingIndex,
                currentCollection ?? '',
                draftSpecsRows[0].validated ?? {}
            );

            setRelatedBindings(response);
        }
    }, [
        currentCollection,
        draftSpecsRows,
        setRelatedBindings,
        stagedBindingIndex,
    ]);

    return relatedBindings;
}
