import { JsonFormsCore } from '@jsonforms/core';
import produce from 'immer';
import { isEqual } from 'lodash';
import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';

interface CaptureCreationDetails
    extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        name: string;
        image: string;
    };
}

interface CaptureCreationSpec extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        [key: string]: any;
    };
}

export interface CaptureCreationState {
    //Details
    details: CaptureCreationDetails;
    setDetails: (details: CaptureCreationDetails) => void;

    //Spec
    spec: CaptureCreationSpec;
    setSpec: (spec: CaptureCreationSpec) => void;

    //Misc
    connectors: { [key: string]: any }[];
    setConnectors: (val: { [key: string]: any }[]) => void;
    resetState: () => void;
    hasChanges: () => boolean;
}

const getInitialStateData = (): Pick<
    CaptureCreationState,
    'details' | 'spec' | 'connectors'
> => {
    return {
        details: {
            data: { image: '', name: '' },
            errors: [],
        },
        spec: {
            data: {},
            errors: [],
        },
        connectors: [],
    };
};

const useCaptureCreationStore = create<CaptureCreationState>(
    devtoolsInNonProd(
        (set, get) => ({
            ...getInitialStateData(),
            setDetails: (details) => {
                set(
                    produce((state) => {
                        if (
                            details.data.image.length > 0 &&
                            state.details.data.image !== details.data.image
                        ) {
                            const initState = getInitialStateData();
                            state.spec = initState.spec;
                        }

                        state.details = details;
                    }),
                    false,
                    'Details changed'
                );
            },

            setSpec: (spec) => {
                set(
                    produce((state) => {
                        state.spec = spec;
                    }),
                    false,
                    'Spec changed'
                );
            },

            hasChanges: () => {
                const { details, spec } = get();
                const { details: initialDetails, spec: initialSpec } =
                    getInitialStateData();

                return !isEqual(
                    {
                        details: details.data,
                        spec: spec.data,
                    },
                    {
                        details: initialDetails.data,
                        spec: initialSpec.data,
                    }
                );
            },
            setConnectors: (val) => {
                set(
                    produce((state) => {
                        state.connectors = val;
                    }),
                    false,
                    'Caching connectors response'
                );
            },
            resetState: () => {
                set(getInitialStateData(), false, 'Resetting State');
            },
        }),
        { name: 'capture-creation-state' }
    )
);

export default useCaptureCreationStore;
