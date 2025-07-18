import type { EnhancedSupportState } from 'src/_compliance/stores/EnhancedSupport/types';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { persistOptions } from 'src/_compliance/stores/EnhancedSupport/shared';
import { devtoolsOptions } from 'src/utils/store-utils';

export const useEnhancedSupportStore = create<EnhancedSupportState>()(
    persist(
        devtools((set) => {
            return {
                enhancedSupportEnabled: false,
                sessionRecordingEnabled: false,

                enhancedSupportExpiration: null,
                sessionRecordingExpiration: null,
                setEnhancedSupportEnabled: (newVal) => {
                    set((state) => ({
                        ...state,
                        enhancedSupportEnabled: newVal,
                    }));
                },

                setEnhancedSupportExpiration: (newVal) => {
                    set((state) => ({
                        ...state,
                        enhancedSupportExpiration: newVal,
                    }));
                },

                setSessionRecordingEnabled: (newVal) => {
                    set((state) => ({
                        ...state,
                        sessionRecordingEnabled: newVal,
                    }));
                },

                setSessionRecordingExpiration: (newVal) => {
                    set((state) => ({
                        ...state,
                        sessionRecordingExpiration: newVal,
                    }));
                },
            };
        }, devtoolsOptions(persistOptions.name)),
        persistOptions
    )
);
