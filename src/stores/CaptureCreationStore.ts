import { JsonFormsCore } from '@jsonforms/core';
import produce from 'immer';
import { isEqual } from 'lodash';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

enum EventNames {
    DETAILS_CHANGED = 'Details Changed',
    DETAILS_REMOVED = 'Details Removed',
    LINKS_CHANGED = 'Links Changed',
    LINKS_REMOVED = 'Links Removed',
    SPEC_CHANGED = 'Spec Changed',
    SPEC_REMOVED = 'Spec Removed',
}

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
    removeDetails: () => void;

    //Links
    links: CaptureCreationStateLinks;
    setLink: (link: keyof CaptureCreationStateLinks, value: string) => void;
    removeLinks: () => void;

    //Spec
    spec: CaptureCreationSpec;
    setSpec: (spec: CaptureCreationSpec) => void;
    removeSpec: () => void;

    //Misc
    cleanUp: () => void;
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
                    EventNames.DETAILS_CHANGED
                );
            },
            removeDetails: () => {
                set(
                    produce((state) => {
                        state.details = getInitialStateData().details;
                    }),
                    false,
                    EventNames.DETAILS_REMOVED
                );
            },

            setLink: (key, value) => {
                set(
                    produce((state) => {
                        state.links[key] = value;
                    }),
                    false,
                    EventNames.LINKS_CHANGED
                );
            },
            removeLinks: () => {
                set(
                    produce((state) => {
                        state.links = getInitialStateData().links;
                    }),
                    false,
                    EventNames.LINKS_REMOVED
                );
            },

            setSpec: (spec) => {
                set(
                    produce((state) => {
                        state.spec = spec;
                    }),
                    false,
                    EventNames.SPEC_CHANGED
                );
            },
            removeSpec: () => {
                set(
                    produce((state) => {
                        state.spec = getInitialStateData().spec;
                    }),
                    false,
                    EventNames.SPEC_REMOVED
                );
            },

            cleanUp: () => {
                set(getInitialStateData(), false);
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
        }),
        { name: 'capture-creation-state' }
    )
);

export default useCaptureCreationStore;
