import type { UserStore } from 'src/context/User/types';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { devtoolsOptions } from 'src/utils/store-utils';

const name = 'estuary.user-provider-store';

const useUserStore = create<UserStore>()(
    devtools((set) => {
        return {
            initialized: false,
            setInitialized: (newVal) => {
                set(
                    (state) => ({
                        ...state,
                        initialized: newVal,
                    }),
                    false,
                    'setInitialized'
                );
            },
            session: null,
            setSession: (newVal) => {
                set(
                    (state) => ({
                        ...state,
                        session: newVal,
                    }),
                    false,
                    'setSession'
                );
            },
            user: null,
            setUser: (newVal) => {
                set(
                    (state) => ({
                        ...state,
                        user: newVal,
                    }),
                    false,
                    'setUser'
                );
            },
            userDetails: null,
            setUserDetails: (newVal) => {
                set(
                    (state) => ({
                        ...state,
                        userDetails: newVal,
                    }),
                    false,
                    'setUserDetails'
                );
            },
        };
    }, devtoolsOptions(name))
);

export { useUserStore };
