import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';
import type { UserStore } from 'src/context/User/types';

const name = 'estuary.user-provider-store';

const useUserStore = create<UserStore>()(
    devtools((set) => {
        return {
            initialized: false,
            setInitialized: (newVal) => {
                set(
                    produce((state) => {
                        state.initialized = newVal;
                    }),
                    false,
                    'setUserDetails'
                );
            },
            session: null,
            setSession: (newVal) => {
                set(
                    produce((state) => {
                        state.session = newVal;
                    }),
                    false,
                    'setUserDetails'
                );
            },
            user: null,
            setUser: (newVal) => {
                set(
                    produce((state) => {
                        state.user = newVal;
                    }),
                    false,
                    'setUserDetails'
                );
            },
            userDetails: null,
            setUserDetails: (newVal) => {
                set(
                    produce((state) => {
                        state.userDetails = newVal;
                    }),
                    false,
                    'setUserDetails'
                );
            },
        };
    }, devtoolsOptions(name))
);

export { useUserStore };
