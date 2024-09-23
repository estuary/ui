import produce from 'immer';
import { authorizeCollection, authorizeTask } from 'utils/dataPlane-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface JournalState {
    collectionBrokerAddress: string;
    collectionBrokerToken: string;
    getAuthToken: (
        accessToken: string,
        catalogName: string,
        isCollection?: boolean
    ) => Promise<void>;
    opsLogsJournal: string;
    taskBrokerAddress: string;
    taskBrokerToken: string;
}

const useJournalStore = create<JournalState>()(
    devtools((set) => {
        return {
            collectionBrokerAddress: '',
            collectionBrokerToken: '',
            opsLogsJournal: '',
            taskBrokerAddress: '',
            taskBrokerToken: '',
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
        };
    }, devtoolsOptions('journal'))
);

export default useJournalStore;
