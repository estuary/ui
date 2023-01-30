import { getLiveSpecsByConnectorId } from 'api/liveSpecsExt';
import { ExistingEntityState } from 'components/shared/Entity/ExistingEntityCards/Store/types';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { getStoreWithHydrationSettings } from 'stores/Hydration';
import { ExistingEntityStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    ExistingEntityState,
    'queryData' | 'createNewTask'
> => ({
    queryData: null,
    createNewTask: false,
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

        setCreateNewTask: (value) => {
            set(
                produce((state: ExistingEntityState) => {
                    state.createNewTask = value;
                }),
                false,
                'Create New Task Flag Set'
            );
        },

        hydrateState: async (entityType) => {
            const searchParams = new URLSearchParams(window.location.search);
            const connectorId = searchParams.get(
                GlobalSearchParams.CONNECTOR_ID
            );

            const { setCreateNewTask, setHydrationErrorsExist } = get();

            if (connectorId) {
                const { data, error } = await getLiveSpecsByConnectorId(
                    entityType,
                    connectorId
                );

                if (error) {
                    setHydrationErrorsExist(true);
                    setCreateNewTask(true);
                }

                if (data && data.length > 0) {
                    const { setQueryData } = get();

                    setQueryData(data);
                } else {
                    setCreateNewTask(true);
                }
            }
        },

        resetState: () => {
            set(
                () => ({
                    ...getInitialStateData(),
                    hydrated: false,
                    hydrationErrorsExist: false,
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
