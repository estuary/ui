import produce from 'immer';
import { authorizeCollection, authorizeTask } from 'utils/dataPlane-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// TODO: Remove the action, getAuthToken, from the store. Store actions
//   should be limited to simple functions that set or manipulate state.
export interface JournalState {
    collectionBrokerAddress: string;
    collectionBrokerToken: string;
    getAuthToken: (
        accessToken: string,
        catalogName: string,
        isCollection?: boolean
    ) => Promise<void>;
    opsLogsJournal: string;
    resetState: () => void;
    taskBrokerAddress: string;
    taskBrokerToken: string;
}

const getInitialState = (): Pick<
    JournalState,
    | 'collectionBrokerAddress'
    | 'collectionBrokerToken'
    | 'opsLogsJournal'
    | 'taskBrokerAddress'
    | 'taskBrokerToken'
> => ({
    collectionBrokerAddress: '',
    collectionBrokerToken: '',
    opsLogsJournal: '',
    taskBrokerAddress: '',
    taskBrokerToken: '',
});

const useJournalStore = create<JournalState>()(
    devtools((set) => {
        return {
            ...getInitialState(),

            getAuthToken: async (accessToken, catalogName, isCollection) => {
                if (isCollection) {
                    const response = await authorizeCollection(
                        accessToken,
                        catalogName
                    );

                    set(
                        produce((state: JournalState) => {
                            state.collectionBrokerAddress =
                                response.brokerAddress;
                            state.collectionBrokerToken = response.brokerToken;
                        }),
                        false,
                        'getCollectionAuthToken'
                    );

                    return;
                }

                const response = await authorizeTask(accessToken, catalogName);

                set(
                    produce((state: JournalState) => {
                        state.opsLogsJournal = response.opsLogsJournal;

                        state.taskBrokerAddress = response.brokerAddress;
                        state.taskBrokerToken = response.brokerToken;
                    }),
                    false,
                    'getTaskAuthToken'
                );
            },

            resetState: () => {
                set(getInitialState(), false, 'resetState');
            },
        };
    }, devtoolsOptions('journal'))
);

export default useJournalStore;
