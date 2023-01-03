import { BindingsEditorState } from 'components/editor/Bindings/Store/types';
import produce from 'immer';
import { BindingsEditorStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    BindingsEditorState,
    'collectionData'
> => ({
    collectionData: null,
});

const getInitialState = (
    set: NamedSet<BindingsEditorState>
    // get: StoreApi<BindingsEditorState>['getState']
): BindingsEditorState => ({
    ...getInitialStateData(),

    setCollectionData: (value) => {
        set(
            produce((state: BindingsEditorState) => {
                state.collectionData = value;
            }),
            false,
            'Collection Data Set'
        );
    },
});

export const createBindingsEditorStore = (key: BindingsEditorStoreNames) =>
    create<BindingsEditorState>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
