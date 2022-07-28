import { EndpointConfigStoreNames } from 'context/Zustand';
import produce from 'immer';
import { isEmpty, map } from 'lodash';
import { JsonFormsData, Schema } from 'types';
import { devtoolsOptions, populateHasErrors } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface EndpointConfigState {
    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;

    endpointConfigErrorsExist: boolean;
    endpointConfigErrors: (string | undefined)[];

    endpointSchema: Schema;
    setEndpointSchema: (val: EndpointConfigState['endpointSchema']) => void;

    // Misc.
    resetState: () => void;
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

    resetState: () => {
        set(getInitialStateData(), false, 'Endpoint Config State Reset');
    },
});

export const createEndpointConfigStore = (key: EndpointConfigStoreNames) => {
    return create<EndpointConfigState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
