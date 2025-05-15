import type { AutoCompleteOption } from 'src/components/incompatibleSchemaChange/types';

import { useCallback } from 'react';

import TargetSchemaForm from 'src/components/materialization/source/targetSchema/Form';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

export default function TargetSchemaUpdateWrapper() {
    // const intl = useIntl();
    // const { enqueueSnackbar } = useSnackbar();

    // const setIncompatibleSchemaChange = useBindingStore(
    //     (state) => state.setSpecOnIncompatibleSchemaChange
    // );

    const setFormState = useFormStateStore_setFormState();

    const [targetSchema] = useSourceCaptureStore((state) => [
        state.targetSchema,
    ]);

    // const { currentSetting, updateOnIncompatibleSchemaChange } =
    //     useSpecificationIncompatibleSchemaSetting();

    const updateServer = useCallback(
        async (option?: AutoCompleteOption | null) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            // updateOnIncompatibleSchemaChange(option?.val)
            //     .then(() => {
            //         setIncompatibleSchemaChange(option?.val);

            //         setFormState({ status: FormStatus.UPDATED });
            //     })
            //     .catch(() => {
            //         enqueueSnackbar(
            //             intl.formatMessage({
            //                 id: 'incompatibleSchemaChange.update.error',
            //             }),
            //             { ...snackbarSettings, variant: 'error' }
            //         );

            //         setIncompatibleSchemaChange(currentSetting);
            //         setFormState({ status: FormStatus.FAILED });
            //     });
        },
        [setFormState]
    );

    return (
        <TargetSchemaForm
            currentSetting={targetSchema}
            scope="spec"
            updateDraftedSetting={updateServer}
        />
    );
}
