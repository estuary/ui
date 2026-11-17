import { useCallback } from 'react';

import {
    useBinding_fullSourceErrorsExist,
    useBinding_resourceConfigErrorsExist,
} from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfigStore_errorsExist } from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

/**
 * Callback hook that checks the workflow's forms for errors. When there are
 * any, the form is failed and its validation errors are shown. Returns
 * whether the forms are valid.
 */
export function useValidateWorkflowForms() {
    const detailsFormErrorsExist = useDetailsFormStore(
        (state) => state.errorsExist
    );
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    const resourceConfigErrorsExist = useBinding_resourceConfigErrorsExist();
    const fullSourceErrorsExist = useBinding_fullSourceErrorsExist();

    const setFormState = useFormStateStore_setFormState();

    return useCallback(() => {
        const valid =
            !detailsFormErrorsExist &&
            !endpointConfigErrorsExist &&
            !resourceConfigErrorsExist &&
            !fullSourceErrorsExist;

        if (!valid) {
            setFormState({
                status: FormStatus.FAILED,
                displayValidation: true,
            });
        }

        return valid;
    }, [
        detailsFormErrorsExist,
        endpointConfigErrorsExist,
        fullSourceErrorsExist,
        resourceConfigErrorsExist,
        setFormState,
    ]);
}
