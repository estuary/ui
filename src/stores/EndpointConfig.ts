import produce from 'immer';
import { isEmpty, map } from 'lodash';
import { JsonFormsData } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface EndpointConfigState {
    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;

    endpointConfigErrorsExist: boolean;
    endpointConfigErrors: (string | undefined)[];

    endpointSchema: { [key: string]: any };
    setEndpointSchema: (val: EndpointConfigState['endpointSchema']) => void;
}

const fetchErrors = ({ errors }: JsonFormsData): JsonFormsData['errors'] => {
    let response: JsonFormsData['errors'] = [];

    if (errors && errors.length > 0) {
        response = response.concat(errors);
    }

    return response;
};

const filterErrors = (list: JsonFormsData['errors']): (string | undefined)[] =>
    map(list, 'message');

const populateHasErrors = (
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
    const resourceConfigHasErrors = resource ?? get().resourceConfigHasErrors;
    const endpointConfigHasErrors = endpoint ?? get().endpointConfigHasErrors;

    state.collectionsHasErrors = isEmpty(collections ?? get().collections);
    state.detailsFormHasErrors = !isEmpty(detailErrors ?? get().details.errors);

    state.hasErrors = Boolean(
        state.collectionsHasErrors ||
            state.detailsFormHasErrors ||
            endpointConfigHasErrors ||
            resourceConfigHasErrors
    );

    state.displayValidation = state.hasErrors;
};

const populateEndpointConfigErrors = (
    endpointConfig: JsonFormsData,
    state: EndpointConfigState,
    get: StoreApi<EndpointConfigState>['getState']
) => {
    const endpointConfigErrors = filterErrors(fetchErrors(endpointConfig));

    state.endpointConfigErrors = endpointConfigErrors;
    state.endpointConfigErrorsExist = !isEmpty(endpointConfigErrors);

    populateHasErrors(get, state, {
        endpoint: !isEmpty(endpointConfigErrors),
    });

    return !isEmpty(endpointConfigErrors);
};

const getInitialStateData = (): Pick<
    EndpointConfigState,
    | 'endpointConfig'
    | 'endpointConfigErrorsExist'
    | 'endpointConfigErrors'
    | 'endpointSchema'
> => ({
    endpointConfig: { data: {}, errors: [] },
    endpointConfigErrorsExist: true,
    endpointConfigErrors: [],
    endpointSchema: {},
});

const getInitialState = (
    set: NamedSet<EndpointConfigState>,
    get: StoreApi<EndpointConfigState>['getState']
): EndpointConfigState => ({
    ...getInitialStateData(),

    setEndpointConfig: (endpointConfig) => {
        set(
            produce((state) => {
                state.endpointConfig = endpointConfig;
                populateEndpointConfigErrors(endpointConfig, state, get);
            }),
            false,
            'Endpoint Config Changed'
        );
    },

    setEndpointSchema: (val) => {
        set(
            produce((state) => {
                state.endpointSchema = val;
            }),
            false,
            'Endpoint Schema Set'
        );
    },
});

export const createEndpointConfigStore = (key: string) => {
    return create<EndpointConfigState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
