import produce from 'immer';
import { TransformCreateStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { TransformCreateState } from './types';

// TODO (transform create)

const getInitialStateData = (): Pick<
    TransformCreateState,
    'language' | 'name'
> => ({
    name: '',
    language: 'sql',
});

const getInitialState = (
    set: NamedSet<TransformCreateState>
    // get: StoreApi<TransformCreateState>['getState']
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

    setName: (val) => {
        set(
            produce((state: TransformCreateState) => {
                state.name = val;
            }),
            false,
            'Transform Create Name Set'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'ransform Create State Reset');
    },
});

export const createTransformationCreateStore = (
    key: TransformCreateStoreNames
) => {
    return create<TransformCreateState>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
};
