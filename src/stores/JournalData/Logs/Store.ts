import produce from 'immer';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { JournalDataStoreNames } from 'stores/names';
import { OpsLogFlowDocument } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { JournalDataLogsState } from './types';

// Since journal data reads data and always returns an array it gets a little weird
//  to hydrate the store synchronously. This means we have to wait for one of two
//  things to happen:
//      1. We parsed all bytes and have no document
//      2. We have at least one document
// This is why we have a hydrate function but do not mark the hydrated/noData fields
//  instead of within the normal hydrate function.
const getReadyToRenderFlags = (
    docs: OpsLogFlowDocument[] | null,
    olderFinished: boolean
) => {
    if (!docs) {
        return {
            // We only know there is no data when we're done reading all bytes
            noData: olderFinished,
            // We have read all data and have still have no docs so we are hydrated
            hydrated: olderFinished,
        };
    } else {
        return {
            noData: olderFinished ? docs.length === 0 : false,
            // We are hydrated if we read all bytes or we have gotten _some_ docs back to render
            hydrated: olderFinished || docs.length > 0,
        };
    }
};

const getInitialStateData = (): Pick<
    JournalDataLogsState,
    | 'allowFetchingMore'
    | 'documents'
    | 'lastCount'
    | 'lastParsed'
    | 'lastTopUuid'
    | 'fetchingNewer'
    | 'fetchingOlder'
    | 'noData'
    | 'olderFinished'
    | 'refresh'
    | 'scrollToWhenDone'
    | 'tailNewLogs'
> => ({
    allowFetchingMore: false,
    documents: null,
    lastCount: -1,
    lastParsed: -1,
    scrollToWhenDone: [-1, 'end'],
    lastTopUuid: null,
    fetchingNewer: false,
    fetchingOlder: false,
    noData: false,
    olderFinished: false,
    refresh: null,
    tailNewLogs: false,
});

const getInitialState = (
    set: NamedSet<JournalDataLogsState>,
    get: StoreApi<JournalDataLogsState>['getState']
): JournalDataLogsState => ({
    ...getInitialStateData(),
    ...getInitialHydrationData(),
    ...getStoreWithHydrationSettings('JournalsData:Logs', set),

    hydrate: async (docs, refresh, olderFinished, lastParsed, error) => {
        const {
            active,
            addNewDocuments,
            hydrated,
            setHydrationErrorsExist,
            setNetworkFailed,
            setRefresh,
        } = get();

        if (!active || hydrated) {
            return;
        }

        setRefresh(refresh);
        setHydrationErrorsExist(Boolean(error));

        if (error) {
            setNetworkFailed(error.message);
            addNewDocuments([], true, 0);
            return;
        }

        addNewDocuments(docs, olderFinished, lastParsed);
    },

    fetchMoreLogs: (option) => {
        const {
            allowFetchingMore,
            fetchingNewer,
            fetchingOlder,
            lastParsed,
            olderFinished,
            refresh,
            setFetchingOlder,
            setFetchingNewer,
        } = get();

        if (!allowFetchingMore || !refresh || fetchingNewer || fetchingOlder) {
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
        console.log('addNewDocuments');
        set(
            produce((state: JournalDataLogsState) => {
                if (!docs) {
                    const { hydrated, noData } = getReadyToRenderFlags(
                        docs,
                        olderFinished
                    );
                    state.hydrated = hydrated;
                    state.noData = noData;
                    return;
                }

                if (state.fetchingOlder) {
                    // When fetching newer keep the previous first item in view
                    //  and then add the new to the start of the list
                    state.scrollToWhenDone = [docs.length + 1, 'start'];
                    state.documents = [...docs, ...(state.documents ?? [])];
                    state.fetchingOlder = false;
                } else if (state.fetchingNewer) {
                    state.documents = [...(state.documents ?? []), ...docs];

                    // Since fetching newer adds items to the end the browser
                    //  will keep the scroll in the same position. So we only set this
                    //  if we're forcing failing of new logs
                    if (state.tailNewLogs) {
                        // We have 2 fake rows so add 2 here
                        state.scrollToWhenDone = [
                            state.documents.length + 2,
                            'start',
                        ];
                    }

                    state.fetchingNewer = false;
                } else {
                    // Initial hydration we want to set the array and scroll to near the bottom
                    state.scrollToWhenDone = [
                        Math.round(docs.length * 0.95),
                        'end',
                    ];
                    state.documents = docs;
                }

                // Helper props for future calls and scrolling
                state.olderFinished = Boolean(olderFinished);
                state.lastParsed = lastParsed;
                if (state.documents.length > 0) {
                    state.lastTopUuid = state.documents[0]._meta.uuid;
                }

                // Now the we have processed some documents we need to mark fields related to hydration
                const { hydrated, noData } = getReadyToRenderFlags(
                    state.documents,
                    state.olderFinished
                );
                state.hydrated = hydrated;
                state.noData = noData;
            }),
            false,
            'JournalsData:Logs: Documents Added'
        );
    },

    setAllowFetchingMore: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.allowFetchingMore = newState;
            }),
            false,
            'JournalsData:Logs: Fetching more can start'
        );
    },

    setRefresh: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.refresh = newState;
            }),
            false,
            'JournalsData:Logs: Refresh set'
        );
    },

    setTailNewLogs: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.tailNewLogs = newState;
            }),
            false,
            'JournalsData:Logs: Tail new logs set'
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
