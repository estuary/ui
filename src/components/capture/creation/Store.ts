import { JsonFormsCore } from '@jsonforms/core';
import produce from 'immer';
import { isEqual } from 'lodash';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

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
    resetState: () => void;
    hasChanges: () => boolean;
}

const getInitialStateData = (): Pick<
    CaptureCreationState,
    'details' | 'links' | 'spec'
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
    };
};

const useCaptureCreationStore = create<CaptureCreationState>(
    devtools(
        (set, get) => ({
            ...getInitialStateData(),
            setDetails: (details) => {
                set(
                    produce((state) => {
                        if (state.details.image !== details.data.image) {
                            state.links.connectorImage = details.data.image;
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
            resetState: () => {
                set(getInitialStateData(), false, 'Resetting State');
            },
        }),
        { name: 'capture-creation-state' }
    )
);

export default useCaptureCreationStore;
