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
    details: Pick<JsonFormsCore, 'data' | 'errors'>;
    setDetails: any;
    removeDetails: any;
    links: CaptureCreationStateLinks;
    setLink: (link: keyof CaptureCreationStateLinks, value: string) => void;
    removeLinks: any;
    // spec: Pick<JsonFormsCore, 'data' | 'errors'>;
    // setSpec: any;
    // removeSpec: any;
}

enum EventNames {
    DETAILS_CHANGED = 'Details Changed',
    DETAILS_REMOVED = 'Details Removed',
    LINKS_CHANGED = 'Links Changed',
    LINKS_REMOVED = 'Links Removed',
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
};

const useCaptureCreationStore = create<CaptureCreationState>(
    devtools(
        (set) => ({
            ...detailsInitialState,
            setDetails: (details: any) => {
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
        }),
        { name: 'capture-creation-state' }
    )
);

export default useCaptureCreationStore;
