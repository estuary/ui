import produce from 'immer';
import { BASE_ERROR } from 'src/services/supabase';
import { devtoolsOptions } from 'src/utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { RefreshTokenState } from './types';

const getInitialStateData = (): Pick<
    RefreshTokenState,
    'description' | 'saving' | 'serverError' | 'token'
> => ({
    description: '',
    saving: false,
    serverError: null,
    token: '',
});

const getInitialState = (
    set: NamedSet<RefreshTokenState>,
    _get: StoreApi<RefreshTokenState>['getState']
): RefreshTokenState => ({
    ...getInitialStateData(),

    resetState: () => {
        set(getInitialStateData(), false, 'State reset');
    },

    setSaving: (value) => {
        set(
            produce((state: RefreshTokenState) => {
                state.saving = value;
            }),
            false,
            'Saving set'
        );
    },

    setServerError: (value) => {
        set(
            produce((state: RefreshTokenState) => {
                state.serverError =
                    typeof value === 'string'
                        ? { ...BASE_ERROR, message: value }
                        : value;
            }),
            false,
            'Server error set'
        );
    },

    setToken: (value) => {
        set(
            produce((state: RefreshTokenState) => {
                state.token = value;
            }),
            false,
            'Refresh token set'
        );
    },

    updateDescription: (value) => {
        set(
            produce((state: RefreshTokenState) => {
                state.description = value;
            }),
            false,
            'Token description updated'
        );
    },
});

export const useRefreshTokenStore = create<RefreshTokenState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('refresh-tokens')
    )
);
