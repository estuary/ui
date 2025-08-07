import type { PrivacySettingStore } from 'src/_compliance/types';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

export const usePrivacySettingStore = create<PrivacySettingStore>()(
    devtools((set) => {
        return {
            updatingSetting: false,
            updateError: null,
            setUpdateError: (newVal) => {
                set(
                    produce((state) => {
                        state.updateError = newVal;
                    }),
                    false,
                    'setUpdateError'
                );
            },
            setUpdatingSetting: (newVal) => {
                set(
                    produce((state) => {
                        state.updatingSetting = newVal;
                    }),
                    false,
                    'setUpdatingSetting'
                );
            },
        };
    }, devtoolsOptions('PrivacySettings'))
);
