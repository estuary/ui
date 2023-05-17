import produce from 'immer';
import { TransformCreateStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { TransformCreateState } from './types';

const getInitialStateData = (): Pick<
    TransformCreateState,
    'catalogName' | 'language' | 'name' | 'prefix'
> => ({
    catalogName: null,
    language: 'sql',
    name: '',
    prefix: '',
});

const getInitialState = (
    set: NamedSet<TransformCreateState>,
    get: StoreApi<TransformCreateState>['getState']
): TransformCreateState => ({
    ...getInitialStateData(),

    setLanguage: (val) => {
        set(
            produce((state: TransformCreateState) => {
                state.language = val;
            }),
            false,
            'Transform Create Language Set'
        );
    },

    setName: (value) => {
        set(
            produce((state: TransformCreateState) => {
                const { prefix } = get();

                state.name = value;
                state.catalogName = prefix ? `${prefix}${value}` : null;
            }),
            false,
            'Transform Create Name Set'
        );
    },

    setPrefix: (value) => {
        set(
            produce((state: TransformCreateState) => {
                state.prefix = value;
                state.catalogName = `${value}${state.name}`;
            }),
            false,
            'Transform Create Prefix Set'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Transform Create State Reset');
    },
});

export const createTransformationCreateStore = (
    key: TransformCreateStoreNames
) => {
    return create<TransformCreateState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
