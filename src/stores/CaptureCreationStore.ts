import { JsonFormsCore } from '@jsonforms/core';
import produce from 'immer';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface CaptureCreationStateLinks {
    connectorImage: string;
    discovered_catalog: string;
    documentation: string;
    spec: string;
}

export interface CaptureCreationState {
    //Details
    details: Pick<JsonFormsCore, 'data' | 'errors'>;
    setDetails: (details: Pick<JsonFormsCore, 'data' | 'errors'>) => void;
    removeDetails: () => void;

    //Links
    links: CaptureCreationStateLinks;
    setLink: (link: keyof CaptureCreationStateLinks, value: string) => void;
    removeLinks: () => void;

    //Spec
    spec: Pick<JsonFormsCore, 'data' | 'errors'>;
    setSpec: (spec: Pick<JsonFormsCore, 'data' | 'errors'>) => void;
    removeSpec: () => void;
}

enum EventNames {
    DETAILS_CHANGED = 'Details Changed',
    DETAILS_REMOVED = 'Details Removed',
    LINKS_CHANGED = 'Links Changed',
    LINKS_REMOVED = 'Links Removed',
    SPEC_CHANGED = 'Spec Changed',
    SPEC_REMOVED = 'Spec Removed',
}

const detailsInitialState = {
    details: { data: { image: '', name: '' } },
    errors: [],
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

const useCaptureCreationStore = create<CaptureCreationState>(
    devtools(
        (set) => ({
            ...detailsInitialState,
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
                        state.details = detailsInitialState.details;
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
                        state.links = detailsInitialState.links;
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
                        state.spec = detailsInitialState.spec;
                    }),
                    false,
                    EventNames.SPEC_REMOVED
                );
            },
        }),
        { name: 'capture-creation-state' }
    )
);

export default useCaptureCreationStore;
