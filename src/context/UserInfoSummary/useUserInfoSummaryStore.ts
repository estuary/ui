import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { devtoolsOptions } from 'utils/store-utils';
import produce from 'immer';
import { UserInfoStore } from './types';

const name = 'estuary.user-info-store';

const useUserInfoSummaryStore = create<UserInfoStore>()(
    devtools((set) => {
        return {
            mutate: null,
            setMutate: (newVal) => {
                set(
                    produce((state) => {
                        state.mutate = newVal;
                    }),
                    false,
                    'setMutate'
                );
            },

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
            hasDemoAccess: false,
            setHasDemoAccess: (newVal) => {
                set(
                    produce((state) => {
                        state.hasDemoAccess = newVal;
                    }),
                    false,
                    'setHasDemoAccess'
                );
            },

            hasSupportAccess: false,
            setHasSupportAccess: (newVal) => {
                set(
                    produce((state) => {
                        state.hasSupportAccess = newVal;
                    }),
                    false,
                    'setHasSupportAccess'
                );
            },

            hasAnyAccess: false,
            setHasAnyAccess: (newVal) => {
                set(
                    produce((state) => {
                        state.hasAnyAccess = newVal;
                    }),
                    false,
                    'setHasAnyAccess'
                );
            },
        };
    }, devtoolsOptions(name))
);

export { useUserInfoSummaryStore };
