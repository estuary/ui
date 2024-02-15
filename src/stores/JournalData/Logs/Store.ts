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
    | 'fetchingMore'
    | 'lastCount'
    | 'lastFetchFailed'
    | 'newestParsed'
    | 'oldestParsed'
    | 'lastTopUuid'
    | 'noData'
    | 'olderFinished'
    | 'refresh'
    | 'scrollToWhenDone'
    | 'tailNewLogs'
> => ({
    allowFetchingMore: false,
    documents: null,
    fetchingMore: false,
    lastCount: -1,
    lastFetchFailed: false,
    newestParsed: -1,
    oldestParsed: -1,
    lastTopUuid: null,
    noData: false,
    olderFinished: false,
    refresh: null,
    scrollToWhenDone: [-1, 'end'],
    tailNewLogs: false,
});

const getInitialState = (
    set: NamedSet<JournalDataLogsState>,
    get: StoreApi<JournalDataLogsState>['getState']
): JournalDataLogsState => ({
    ...getInitialStateData(),
    ...getInitialHydrationData(),
    ...getStoreWithHydrationSettings('JournalsData:Logs', set),

    hydrate: async (docs, refresh, oldestParsed, newestParsed, error) => {
        const {
            active,
            addNewDocuments,
            hydrated,
            setHydrationErrorsExist,
            setNetworkFailed,
            setRefresh,
        } = get();

        if (!active) {
            return;
        }

        if (!hydrated) {
            setHydrationErrorsExist(Boolean(error));

            if (error) {
                setNetworkFailed(error.message);
                addNewDocuments([0, 0, []]);
                return;
            }
        }

        setRefresh(refresh);
        addNewDocuments(docs, error);
    },

    fetchMoreLogs: (option) => {
        console.log('fetchMoreLogs');
        const {
            allowFetchingMore,
            fetchingMore,
            newestParsed,
            oldestParsed,
            olderFinished,
            refresh,
            setFetchingMore,
        } = get();

        if (!allowFetchingMore || !refresh || fetchingMore) {
            console.log('fetchMoreLogs skipped');
            return;
        }

        if (option === 'old' && !olderFinished) {
            setFetchingMore(true);
            refresh({
                offset: -1,
                endOffset: oldestParsed,
            });
        } else {
            setFetchingMore(true);
            refresh({
                offset: newestParsed,
                endOffset: -1,
            });
        }
    },

    addNewDocuments: (data, error) => {
        set(
            produce((state: JournalDataLogsState) => {
                const start = data[0];
                const end = data[1];
                const docs = data[2];

                console.log('addNewDocuments', {
                    docs,
                    start,
                    end,
                });
                // Check if we hit the oldest byte
                const olderFinished = start === 0;

                if (!docs) {
                    console.log('no docs');
                    const { hydrated, noData } = getReadyToRenderFlags(
                        docs,
                        olderFinished
                    );
                    state.hydrated = hydrated;
                    state.noData = noData;
                    return;
                }

                // Figure out what we're loading in
                const initialLoading =
                    state.oldestParsed === -1 && state.newestParsed === -1;
                const loadingOlder =
                    !initialLoading && state.oldestParsed > start;
                const loadingNewer =
                    !initialLoading && state.newestParsed < end;

                console.log('loading...', {
                    loadingOlder,
                    loadingNewer,
                    initialLoading,
                    start,
                    end,
                });

                if (!initialLoading && !loadingOlder && !loadingNewer) {
                    // If we are not initing if we are here then it means the same range of
                    //  data is being passed in. Usually means are are polling for newer
                    //  logs and nothing is being written to them.
                    state.fetchingMore = false;
                    return;
                }

                if (loadingOlder) {
                    if (error) {
                        state.lastFetchFailed = true;
                    } else {
                        // When fetching newer keep the previous first item in view
                        //  and then add the new to the start of the list
                        state.scrollToWhenDone = [docs.length + 1, 'start'];
                        state.documents = [...docs, ...(state.documents ?? [])];
                        state.lastFetchFailed = false;
                        state.oldestParsed = start;
                    }
                } else if (loadingNewer) {
                    if (error) {
                        state.lastFetchFailed = true;
                    } else {
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
                        state.lastFetchFailed = false;
                        state.newestParsed = end;
                    }
                } else if (docs.length > 0) {
                    // Initial hydration we want to set the array and scroll to near the bottom
                    state.scrollToWhenDone = [
                        Math.round(docs.length * 0.95),
                        'end',
                    ];
                    state.documents = docs;
                    state.lastFetchFailed = false;

                    // When init we need to set both
                    state.oldestParsed = start;
                    state.newestParsed = end;
                }

                // Helper props for future calls and scrolling
                state.olderFinished = Boolean(olderFinished);
                state.fetchingMore = false;

                // If we have docs lets make sure we keep local state updated
                if (state.documents && state.documents.length > 0) {
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

    setFetchingMore: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.fetchingMore = newState;
            }),
            false,
            'JournalsData:Logs: Fetching More Set'
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
