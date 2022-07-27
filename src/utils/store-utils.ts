// TODO (zustand) - add in Immer middleware

import { isEmpty } from 'lodash';
import { isProduction, isTest } from 'utils/env-utils';

export const devtoolsOptions = (name: string) => {
    return {
        enabled: !isProduction && !isTest,
        name,
    };
};

// TODO: Decompose this function accordingly.
export const populateHasErrors = (
    get: any,
    state: any,
    configs: {
        resource?: any;
        endpoint?: any;
    },
    collections?: any,
    detailErrors?: any
) => {
    const { resource, endpoint } = configs;

    // We can just pull these since these values are updated when
    // the config itself is updated
    const endpointConfigErrorsExist =
        endpoint ?? get().endpointConfigErrorsExist;

    const resourceConfigErrorsExist =
        resource ?? get().resourceConfigErrorsExist;

    state.collectionsHasErrors = isEmpty(collections ?? get().collections);
    state.detailsFormHasErrors = !isEmpty(detailErrors ?? get().details.errors);

    state.hasErrors = Boolean(
        state.collectionsHasErrors ||
            state.detailsFormHasErrors ||
            endpointConfigErrorsExist ||
            resourceConfigErrorsExist
    );

    state.displayValidation = state.hasErrors;
};
