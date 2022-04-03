import { JsonFormsCore } from '@jsonforms/core';
import produce from 'immer';
import { isEqual } from 'lodash';
import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';

interface CaptureCreationStateLinks {
    connectorImage: string;
    discovered_catalog: string;
    documentation: string;
    spec: string;
}

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

    //Links
    links: CaptureCreationStateLinks;
    setLink: (link: keyof CaptureCreationStateLinks, value: string) => void;

    //Spec
    spec: CaptureCreationSpec;
    setSpec: (spec: CaptureCreationSpec) => void;

    //Misc
    hasConnectors: boolean;
    setHasConnectors: (val: boolean) => void;
    resetState: () => void;
    hasChanges: () => boolean;
}

const getInitialStateData = (): Pick<
    CaptureCreationState,
    'details' | 'links' | 'spec' | 'hasConnectors'
> => {
    return {
        details: {
            data: { image: '', name: '' },
            errors: [],
        },
        links: {
            connectorImage: '',
            discovered_catalog: '',
            documentation: '',
            spec: '',
        },
        spec: {
            data: {},
            errors: [],
        },
        hasConnectors: false,
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

                            state.links = initState.links;
                            state.links.connectorImage = details.data.image;

                            state.spec = initState.spec;
                        }

                        state.details = details;
                    }),
                    false,
                    'Details changed'
                );
            },

            setLink: (key, value) => {
                set(
                    produce((state) => {
                        state.links[key] = value;
                    }),
                    false,
                    `${key} link updated`
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
            setHasConnectors: (val) => {
                set(
                    produce((state) => {
                        state.hasConnectors = val;
                    }),
                    false,
                    'Form has connectors'
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
