import { useCallback } from 'react';

import { useBindingsEditorStore_resetState } from 'src/components/editor/Bindings/Store/hooks';
import { useEditorStore_resetState } from 'src/components/editor/Store/hooks';
import { useBinding_resetState } from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfigStore_reset } from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_resetState } from 'src/stores/FormState/hooks';
import { useSchemaEvolution_resetState } from 'src/stores/SchemaEvolution/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { useTransformationCreate_resetState } from 'src/stores/TransformationCreate/hooks';

//  !!!!!!!!!!!!!!!!!!!!!!!! DO NOT PUT WORKFLOW STORE IN HERE !!!!!!!!!!!!!!!!!!!!!!!!
//  This needs to be called on entering all edit/create and edit has a draft init component
//      that is called BEFORE the workflow store is ready. So this resets all the base states
//      so we can call reset from StoreCleaner in the same way between all creates and edits.
function useBaseEntityStoreReset() {
    const resetBindingState = useBinding_resetState();
    const resetBindingsEditorStore = useBindingsEditorStore_resetState();
    const resetDetailsFormState = useDetailsFormStore(
        (state) => state.resetState
    );
    const resetEditorStore = useEditorStore_resetState();
    const resetEndpointConfigState = useEndpointConfigStore_reset();
    const resetFormState = useFormStateStore_resetState();
    const resetSchemaEvolutionState = useSchemaEvolution_resetState();
    const resetSourceCapture = useSourceCaptureStore(
        (state) => state.resetState
    );
    const resetTransformationCreateState = useTransformationCreate_resetState();

    return useCallback(() => {
        resetFormState();
        resetEndpointConfigState();
        resetDetailsFormState();
        resetBindingState(undefined, true);
        resetEditorStore();
        resetBindingsEditorStore();
        resetSchemaEvolutionState();
        resetSourceCapture();
        resetTransformationCreateState();
    }, [
        resetBindingState,
        resetBindingsEditorStore,
        resetDetailsFormState,
        resetEditorStore,
        resetEndpointConfigState,
        resetFormState,
        resetSchemaEvolutionState,
        resetSourceCapture,
        resetTransformationCreateState,
    ]);
}

export default useBaseEntityStoreReset;
