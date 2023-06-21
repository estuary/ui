import { getLiveSpecsByConnectorId } from 'api/liveSpecsExt';
import { ExistingEntityState } from 'components/shared/Entity/ExistingEntityCards/Store/types';
import produce from 'immer';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { ExistingEntityStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    ExistingEntityState,
    'connectorName' | 'createNewTask' | 'queryData'
> => ({
    connectorName: null,
    createNewTask: false,
    queryData: null,
});

const getInitialState = (
    set: NamedSet<ExistingEntityState>,
    get: StoreApi<ExistingEntityState>['getState']
): ExistingEntityState => {
    return {
        ...getInitialStateData(),
        ...getStoreWithHydrationSettings('Existing Entity Store', set),

        setQueryData: (value) => {
            set(
                produce((state: ExistingEntityState) => {
                    state.queryData = value;
                }),
                false,
                'Query Data Set'
            );
        },

        setConnectorName: (value) => {
            set(
                produce((state: ExistingEntityState) => {
                    state.connectorName = value;
                }),
                false,
                'Connector Name Set'
            );
        },

        setCreateNewTask: (value) => {
            set(
                produce((state: ExistingEntityState) => {
                    state.createNewTask = value;
                }),
                false,
                'Create New Task Flag Set'
            );
        },

        hydrateState: async (entityType, connectorId) => {
            if (connectorId) {
                const { setCreateNewTask, setHydrationErrorsExist } = get();

                const { data, error } = await getLiveSpecsByConnectorId(
                    entityType,
                    connectorId,
                    ['ops', 'demo']
                );

                if (error) {
                    setHydrationErrorsExist(true);
                    setCreateNewTask(true);
                } else if (data && data.length > 0) {
                    const { setQueryData, setConnectorName } = get();

                    setQueryData(data);
                    setConnectorName(data[0].title);
                } else {
                    setCreateNewTask(true);
                }
            }
        },

        resetState: () => {
            set(
                () => ({
                    ...getInitialStateData(),
                    ...getInitialHydrationData(),
                }),
                false,
                'Existing Entity State Reset'
            );
        },
    };
};

export const createExistingEntityStore = (key: ExistingEntityStoreNames) => {
    return create<ExistingEntityState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
