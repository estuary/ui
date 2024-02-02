import produce from 'immer';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { JournalDataStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { JournalDataLogsState } from './types';

const getInitialStateData = (): Pick<
    JournalDataLogsState,
    | 'documents'
    | 'lastCount'
    | 'lastParsed'
    | 'lastTopUuid'
    | 'fetchingNewer'
    | 'fetchingOlder'
    | 'olderFinished'
    | 'refresh'
    | 'scrollOnLoad'
    | 'scrollToWhenDone'
> => ({
    documents: [],
    lastCount: -1,
    lastParsed: -1,
    scrollToWhenDone: [-1, 'bottom'],
    lastTopUuid: null,
    fetchingNewer: false,
    fetchingOlder: false,
    olderFinished: false,
    scrollOnLoad: true,
    refresh: () => {},
});

const getInitialState = (
    set: NamedSet<JournalDataLogsState>,
    get: StoreApi<JournalDataLogsState>['getState']
): JournalDataLogsState => ({
    ...getInitialStateData(),
    ...getInitialHydrationData(),
    ...getStoreWithHydrationSettings('JournalsData:Logs', set),

    hydrate: async (docs, error, refresh, olderFinished, lastParsed) => {
        const {
            active,
            hydrated,
            setHydrationErrorsExist,
            setNetworkFailed,
            addNewDocuments,
        } = get();

        if (!active || hydrated) {
            return;
        }

        setHydrationErrorsExist(Boolean(error));

        if (error) {
            setNetworkFailed(error.message);

            return set(
                produce((state: JournalDataLogsState) => {
                    state.documents = [];
                }),
                false,
                'JournalsData:Logs:Hydrate: Error'
            );
        }

        addNewDocuments(docs, olderFinished, lastParsed);

        set(
            produce((state: JournalDataLogsState) => {
                // Flag so we know the store is ready
                state.hydrated = true;

                // Helper functions set
                state.refresh = refresh;
            }),
            false,
            'JournalsData:Logs:Hydrate: Setting'
        );
    },

    fetchMoreLogs: (option) => {
        const {
            fetchingNewer,
            fetchingOlder,
            lastParsed,
            olderFinished,
            refresh,
            setFetchingOlder,
            setFetchingNewer,
        } = get();

        if (!refresh || fetchingNewer || fetchingOlder) {
            return;
        }

        if (option === 'old') {
            if (olderFinished) {
                return;
            }

            setFetchingOlder(true);
            refresh({
                offset: 0,
                endOffset: lastParsed,
            });
        } else {
            setFetchingNewer(true);
            refresh();
        }
    },

    addNewDocuments: (docs, olderFinished, lastParsed) => {
        set(
            produce((state: JournalDataLogsState) => {
                if (state.fetchingNewer) {
                    // When fetching newer keep the previous first item in view
                    //  and then add the new to the start of the list
                    state.scrollToWhenDone = [docs.length, 'top'];
                    state.documents = [...docs, ...state.documents];
                } else if (state.fetchingOlder) {
                    // When fetching older keep the previous last item in view
                    //  and then add the new docs to the end of the list
                    state.scrollToWhenDone = [state.documents.length, 'bottom'];
                    state.documents = [...state.documents, ...docs];
                } else {
                    // Initial hydration we want to set the array and scroll to near the bottom
                    state.scrollToWhenDone = [
                        Math.round(docs.length * 0.95),
                        'bottom',
                    ];
                    state.documents = docs;
                }

                // Helper props for future calls and scrolling
                state.olderFinished = Boolean(olderFinished);
                state.lastParsed = lastParsed ?? -1;
                if (state.documents.length > 0) {
                    state.lastTopUuid = state.documents[0]._meta.uuid;
                }
            }),
            false,
            'JournalsData:Logs: Documents Set'
        );
    },

    setLastCount: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.lastCount = newState;
            }),
            false,
            'JournalsData:Logs: Last Count Set'
        );
    },

    setFetchingNewer: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.fetchingNewer = newState;
            }),
            false,
            'JournalsData:Logs: Fetching Newer Set'
        );
    },

    setFetchingOlder: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.fetchingOlder = newState;
            }),
            false,
            'JournalsData:Logs: Fetching Older Set'
        );
    },

    setOlderFinished: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.olderFinished = newState;
            }),
            false,
            'JournalsData:Logs: Older Finished Set'
        );
    },

    setScrollOnLoad: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.scrollOnLoad = newState;
            }),
            false,
            'JournalsData:Logs: Scroll On Load Set'
        );
    },

    resetState: () => {
        set(
            { ...getInitialStateData(), ...getInitialHydrationData() },
            false,
            'JournalsData:Logs: Reset'
        );
    },
});

export const createJournalDataLogsStore = (key: JournalDataStoreNames) => {
    return create<JournalDataLogsState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
