import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';

function useBindingDisabled(bindingUUID: string | null) {
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const index = useBindingStore(
        useShallow((state) => {
            if (!bindingUUID) {
                return -1;
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return state.resourceConfigs[bindingUUID]?.meta?.bindingIndex;
        })
    );

    const response = useMemo(() => {
        if (index < 0) {
            return false;
        }

        const draftSpec =
            draftSpecs.length > 0 && draftSpecs[0].spec
                ? draftSpecs[0].spec
                : null;

        return Boolean(draftSpec?.bindings?.[index]?.disable);
    }, [draftSpecs, index]);

    return response;
}

export default useBindingDisabled;
