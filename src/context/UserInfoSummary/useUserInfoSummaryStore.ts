import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { UserInfoStore } from './types';
import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

const name = 'estuary.user-info-store';

const useUserInfoSummaryStore = create<UserInfoStore>()(
    devtools((set) => {
        return {
            hasDemoAccess: false,
            hasSupportAccess: false,
            hasAnyAccess: false,
            mutate: null,
            populateAll: (newVal) => {
                set(
                    produce((state) => {
                        state.hasDemoAccess = newVal.hasDemoAccess;
                        state.hasSupportAccess = newVal.hasSupportAccess;
                        state.hasAnyAccess = newVal.hasAnyAccess;
                    }),
                    false,
                    'setHasDemoAccess'
                );
            },
            setHasDemoAccess: (newVal) => {
                set(
                    produce((state) => {
                        state.hasDemoAccess = newVal;
                    }),
                    false,
                    'setHasDemoAccess'
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
