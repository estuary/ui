import type { UserInfoStore } from 'src/context/UserInfoSummary/types';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

const name = 'estuary.user-info-store';

const useUserInfoSummaryStore = create<UserInfoStore>()(
    devtools((set) => {
        return {
            hasSupportAccess: false,
            hasAnyAccess: false,
            mutate: null,
            populateAll: (newVal) => {
                set(
                    produce((state) => {
                        state.hasSupportAccess = newVal.hasSupportAccess;
                        state.hasAnyAccess = newVal.hasAnyAccess;
                    }),
                    false,
                    'populateAll'
                );
            },
            setMutate: (newVal) => {
                set(
                    produce((state) => {
                        state.mutate = newVal;
                    }),
                    false,
                    'setMutate'
                );
            },
        };
    }, devtoolsOptions(name))
);

export { useUserInfoSummaryStore };
